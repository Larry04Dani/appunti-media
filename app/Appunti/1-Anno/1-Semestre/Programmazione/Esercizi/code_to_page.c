#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <errno.h>
#include <unistd.h>
#include <dirent.h>
#include <sys/stat.h>
#include <sys/types.h>

#define MAX_PATH 1024
#define MAX_EXERCISES 128
#define INITIAL_BUF_SIZE 4096

/* ========================================================================= */
/* Buffer dinamico per la costruzione di stringhe                            */
/* ========================================================================= */
typedef struct {
    char *data;
    size_t len;
    size_t cap;
} DynBuffer;

static void buf_init(DynBuffer *b) {
    b->cap = INITIAL_BUF_SIZE;
    b->len = 0;
    b->data = (char *)malloc(b->cap);
    if (b->data) b->data[0] = '\0';
}

static void buf_append_char(DynBuffer *b, char c) {
    if (b->len + 2 > b->cap) {
        b->cap = b->cap * 2 + 16;
        b->data = (char *)realloc(b->data, b->cap);
    }
    b->data[b->len++] = c;
    b->data[b->len] = '\0';
}

static void buf_append_str(DynBuffer *b, const char *str) {
    if (!str) return;
    size_t slen = strlen(str);
    if (b->len + slen + 1 > b->cap) {
        while (b->len + slen + 1 > b->cap) {
            b->cap = b->cap * 2 + 16;
        }
        b->data = (char *)realloc(b->data, b->cap);
    }
    memcpy(b->data + b->len, str, slen);
    b->len += slen;
    b->data[b->len] = '\0';
}

static void buf_free(DynBuffer *b) {
    if (b->data) {
        free(b->data);
        b->data = NULL;
    }
    b->len = 0;
    b->cap = 0;
}

/* ========================================================================= */
/* Struttura dati per un singolo esercizio                                   */
/* ========================================================================= */
typedef struct {
    int num;
    DynBuffer delivery_md;       /* Testo della consegna formattato in MDX */
    char source_path[MAX_PATH];   /* Percorso del file .c */
    char source_name[MAX_PATH];   /* Nome file .c (es: es1.c) */
    char *source_code;            /* Contenuto del codice sorgente */
    int has_source;
    char binary_path[MAX_PATH];   /* Percorso del binario (es: es1) */
    char binary_name[MAX_PATH];   /* Nome del file binario */
    int has_binary;
    char dsym_path[MAX_PATH];     /* Cartella debug dSYM (macOS) */
    int has_dsym;
} Exercise;

/* ========================================================================= */
/* Funzioni di utilità portabili per stringhe e file                         */
/* ========================================================================= */
static const char *ci_strstr(const char *haystack, const char *needle) {
    if (!haystack || !needle) return NULL;
    if (*needle == '\0') return haystack;
    for (; *haystack != '\0'; haystack++) {
        const char *h = haystack;
        const char *n = needle;
        while (*h != '\0' && *n != '\0' && tolower((unsigned char)*h) == tolower((unsigned char)*n)) {
            h++;
            n++;
        }
        if (*n == '\0') return haystack;
    }
    return NULL;
}

static int ci_strncasecmp(const char *s1, const char *s2, size_t n) {
    for (size_t i = 0; i < n; i++) {
        int c1 = tolower((unsigned char)s1[i]);
        int c2 = tolower((unsigned char)s2[i]);
        if (c1 != c2) return c1 - c2;
        if (s1[i] == '\0') return 0;
    }
    return 0;
}

/* Decodifica entità HTML comuni in caratteri UTF-8 */
static const char *decode_html_entity(const char *p, size_t *consumed) {
    if (*p != '&') return NULL;
    if (strncmp(p, "&agrave;", 8) == 0) { *consumed = 8; return "à"; }
    if (strncmp(p, "&egrave;", 8) == 0) { *consumed = 8; return "è"; }
    if (strncmp(p, "&eacute;", 8) == 0) { *consumed = 8; return "é"; }
    if (strncmp(p, "&igrave;", 8) == 0) { *consumed = 8; return "ì"; }
    if (strncmp(p, "&ograve;", 8) == 0) { *consumed = 8; return "ò"; }
    if (strncmp(p, "&ugrave;", 8) == 0) { *consumed = 8; return "ù"; }
    if (strncmp(p, "&Agrave;", 8) == 0) { *consumed = 8; return "À"; }
    if (strncmp(p, "&Egrave;", 8) == 0) { *consumed = 8; return "È"; }
    if (strncmp(p, "&Eacute;", 8) == 0) { *consumed = 8; return "É"; }
    if (strncmp(p, "&Igrave;", 8) == 0) { *consumed = 8; return "Ì"; }
    if (strncmp(p, "&Ograve;", 8) == 0) { *consumed = 8; return "Ò"; }
    if (strncmp(p, "&Ugrave;", 8) == 0) { *consumed = 8; return "Ù"; }
    if (strncmp(p, "&nbsp;", 6) == 0)   { *consumed = 6; return " "; }
    if (strncmp(p, "&amp;", 5) == 0)    { *consumed = 5; return "&"; }
    if (strncmp(p, "&quot;", 6) == 0)   { *consumed = 6; return "\""; }
    if (strncmp(p, "&apos;", 6) == 0)   { *consumed = 6; return "'"; }
    if (strncmp(p, "&lt;", 4) == 0)     { *consumed = 4; return "<"; }
    if (strncmp(p, "&gt;", 4) == 0)     { *consumed = 4; return ">"; }
    return NULL;
}

/* Legge l'intero contenuto di un file in memoria */
static char *read_entire_file(const char *path) {
    FILE *f = fopen(path, "rb");
    if (!f) return NULL;
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);
    if (size < 0) {
        fclose(f);
        return NULL;
    }
    char *content = (char *)malloc(size + 1);
    if (!content) {
        fclose(f);
        return NULL;
    }
    size_t read_bytes = fread(content, 1, size, f);
    content[read_bytes] = '\0';
    fclose(f);
    return content;
}

/* Rimozione ricorsiva di una cartella (es: bundle .dSYM di macOS) */
static int remove_dir_recursive(const char *path) {
    DIR *d = opendir(path);
    if (!d) return -1;
    struct dirent *entry;
    char subpath[MAX_PATH];
    while ((entry = readdir(d)) != NULL) {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0)
            continue;
        snprintf(subpath, sizeof(subpath), "%s/%s", path, entry->d_name);
        struct stat st;
        if (stat(subpath, &st) == 0) {
            if (S_ISDIR(st.st_mode)) {
                remove_dir_recursive(subpath);
            } else {
                unlink(subpath);
            }
        }
    }
    closedir(d);
    return rmdir(path);
}

/* ========================================================================= */
/* Normalizzazione e pulizia del testo Markdown                              */
/* ========================================================================= */
static void clean_markdown(DynBuffer *b) {
    if (!b->data || b->len == 0) return;

    DynBuffer out;
    buf_init(&out);

    size_t i = 0;
    while (i < b->len) {
        /* Salta spazi o newline iniziali prima del primo carattere */
        if (out.len == 0 && (b->data[i] == ' ' || b->data[i] == '\t' || b->data[i] == '\n' || b->data[i] == '\r')) {
            i++;
            continue;
        }

        /* Gestione newline consecutivi: massimo 2 (un solo rigo vuoto) */
        if (b->data[i] == '\n') {
            int count = 0;
            while (i < b->len && (b->data[i] == '\n' || b->data[i] == '\r' || b->data[i] == ' ' || b->data[i] == '\t')) {
                if (b->data[i] == '\n') count++;
                i++;
            }
            if (i < b->len) {
                if (b->data[i] == '-' && i + 1 < b->len && b->data[i + 1] == ' ') {
                    buf_append_char(&out, '\n');
                } else if (out.len > 0 && out.data[out.len - 1] == '\n') {
                    /* Già terminato con newline */
                } else {
                    if (count >= 2) {
                        buf_append_str(&out, "\n\n");
                    } else {
                        buf_append_char(&out, '\n');
                    }
                }
            }
            continue;
        }

        /* Spazi multipli consecutivi su una stessa riga */
        if (b->data[i] == ' ' || b->data[i] == '\t') {
            if (out.len > 0 && out.data[out.len - 1] != ' ' && out.data[out.len - 1] != '\n') {
                buf_append_char(&out, ' ');
            }
            i++;
            continue;
        }

        /* Se troviamo '- ' seguito da spazi o newline, saltali per iniziare subito col testo */
        if (b->data[i] == '-' && i + 1 < b->len && b->data[i + 1] == ' ') {
            buf_append_str(&out, "- ");
            i += 2;
            while (i < b->len && (b->data[i] == ' ' || b->data[i] == '\t' || b->data[i] == '\r' || b->data[i] == '\n')) {
                i++;
            }
            continue;
        }

        buf_append_char(&out, b->data[i]);
        i++;
    }

    /* Rimuovi spazi e newline finali */
    while (out.len > 0 && (out.data[out.len - 1] == ' ' || out.data[out.len - 1] == '\t' ||
                          out.data[out.len - 1] == '\n' || out.data[out.len - 1] == '\r')) {
        out.data[--out.len] = '\0';
    }

    free(b->data);
    b->data = out.data;
    b->len = out.len;
    b->cap = out.cap;
}

/* ========================================================================= */
/* Parser HTML per il file di consegna: estrae gli esercizi da <ol><li>...   */
/* ========================================================================= */
static int parse_consegna_html(const char *html, Exercise exercises[], int max_exercises) {
    int ex_count = 0;
    int in_ol = 0;
    int in_ul = 0;
    int in_top_li = 0;
    int in_link = 0;
    char link_url[MAX_PATH] = {0};
    DynBuffer link_text;
    buf_init(&link_text);

    const char *p = html;
    int has_ol = (ci_strstr(html, "<ol") != NULL);

    while (*p != '\0') {
        if (*p == '<') {
            const char *tag_start = p + 1;
            int is_closing = (*tag_start == '/');
            if (is_closing) tag_start++;

            const char *tag_end = strchr(p, '>');
            if (!tag_end) {
                p++;
                continue;
            }

            char tag_name[64];
            size_t name_len = 0;
            const char *tn = tag_start;
            while (tn < tag_end && !isspace((unsigned char)*tn) && *tn != '/' && name_len < sizeof(tag_name) - 1) {
                tag_name[name_len++] = (char)tolower((unsigned char)*tn);
                tn++;
            }
            tag_name[name_len] = '\0';

            if (strcmp(tag_name, "!--") == 0) {
                const char *comm_end = strstr(p, "-->");
                if (comm_end) {
                    p = comm_end + 3;
                    continue;
                }
            } else if (strcmp(tag_name, "ol") == 0) {
                if (is_closing) {
                    if (in_ol > 0) in_ol--;
                } else {
                    in_ol++;
                }
            } else if (strcmp(tag_name, "ul") == 0) {
                if (is_closing) {
                    if (in_ul > 0) in_ul--;
                    if (in_top_li && ex_count > 0) {
                        buf_append_str(&exercises[ex_count - 1].delivery_md, "\n\n");
                    }
                } else {
                    in_ul++;
                    if (in_top_li && ex_count > 0) {
                        buf_append_str(&exercises[ex_count - 1].delivery_md, "\n\n");
                    }
                }
            } else if (strcmp(tag_name, "li") == 0) {
                if (is_closing) {
                    if (in_ul > 0 && in_top_li && ex_count > 0) {
                        buf_append_char(&exercises[ex_count - 1].delivery_md, '\n');
                    } else if (in_ul == 0) {
                        in_top_li = 0;
                    }
                } else {
                    if ((!has_ol && in_ul == 0) || (in_ol >= 1 && in_ul == 0)) {
                        /* Inizio di un nuovo esercizio a livello primario */
                        if (ex_count < max_exercises) {
                            ex_count++;
                            exercises[ex_count - 1].num = ex_count;
                            buf_init(&exercises[ex_count - 1].delivery_md);
                            exercises[ex_count - 1].has_source = 0;
                            exercises[ex_count - 1].has_binary = 0;
                            exercises[ex_count - 1].has_dsym = 0;
                            exercises[ex_count - 1].source_code = NULL;
                            exercises[ex_count - 1].source_path[0] = '\0';
                            exercises[ex_count - 1].source_name[0] = '\0';
                            exercises[ex_count - 1].binary_path[0] = '\0';
                            exercises[ex_count - 1].binary_name[0] = '\0';
                            exercises[ex_count - 1].dsym_path[0] = '\0';
                            in_top_li = 1;
                        }
                    } else if (in_ul > 0 && in_top_li && ex_count > 0) {
                        /* Sotto-elemento puntato di una lista */
                        buf_append_str(&exercises[ex_count - 1].delivery_md, "\n- ");
                    }
                }
            } else if (strcmp(tag_name, "br") == 0) {
                if (in_top_li && ex_count > 0) {
                    buf_append_str(&exercises[ex_count - 1].delivery_md, "\n\n");
                }
            } else if (strcmp(tag_name, "p") == 0) {
                if (in_top_li && ex_count > 0) {
                    buf_append_str(&exercises[ex_count - 1].delivery_md, "\n\n");
                }
            } else if (strcmp(tag_name, "b") == 0 || strcmp(tag_name, "strong") == 0) {
                if (in_top_li && ex_count > 0) {
                    DynBuffer *buf = in_link ? &link_text : &exercises[ex_count - 1].delivery_md;
                    if (is_closing) {
                        while (buf->len > 0 && buf->data[buf->len - 1] == ' ') buf->data[--buf->len] = '\0';
                        buf_append_str(buf, "**");
                    } else {
                        buf_append_str(buf, "**");
                        while (*(p + 1) == ' ') p++;
                    }
                }
            } else if (strcmp(tag_name, "i") == 0 || strcmp(tag_name, "em") == 0) {
                if (in_top_li && ex_count > 0) {
                    DynBuffer *buf = in_link ? &link_text : &exercises[ex_count - 1].delivery_md;
                    if (is_closing) {
                        while (buf->len > 0 && buf->data[buf->len - 1] == ' ') buf->data[--buf->len] = '\0';
                        buf_append_char(buf, '*');
                    } else {
                        buf_append_char(buf, '*');
                        while (*(p + 1) == ' ') p++;
                    }
                }
            } else if (strcmp(tag_name, "tt") == 0 || strcmp(tag_name, "code") == 0) {
                if (in_top_li && ex_count > 0) {
                    DynBuffer *buf = in_link ? &link_text : &exercises[ex_count - 1].delivery_md;
                    if (is_closing) {
                        while (buf->len > 0 && buf->data[buf->len - 1] == ' ') buf->data[--buf->len] = '\0';
                        buf_append_char(buf, '`');
                    } else {
                        buf_append_char(buf, '`');
                        while (*(p + 1) == ' ') p++;
                    }
                }
            } else if (strcmp(tag_name, "a") == 0) {
                if (is_closing) {
                    if (in_top_li && ex_count > 0 && in_link) {
                        /* Normalizza testo del link */
                        char *lt = link_text.data;
                        while (*lt == ' ' || *lt == '\t' || *lt == '\n' || *lt == '\r' || *lt == ')') {
                            lt++;
                        }
                        size_t lt_len = strlen(lt);
                        while (lt_len > 0 && (lt[lt_len - 1] == ' ' || lt[lt_len - 1] == '\t' || lt[lt_len - 1] == '\n' || lt[lt_len - 1] == '\r')) {
                            lt[--lt_len] = '\0';
                        }
                        if (link_url[0] != '\0') {
                            buf_append_char(&exercises[ex_count - 1].delivery_md, '[');
                            buf_append_str(&exercises[ex_count - 1].delivery_md, lt);
                            buf_append_str(&exercises[ex_count - 1].delivery_md, "](");
                            buf_append_str(&exercises[ex_count - 1].delivery_md, link_url);
                            buf_append_char(&exercises[ex_count - 1].delivery_md, ')');
                        } else {
                            buf_append_str(&exercises[ex_count - 1].delivery_md, lt);
                        }
                        in_link = 0;
                        link_url[0] = '\0';
                        link_text.len = 0;
                        link_text.data[0] = '\0';
                    }
                } else {
                    link_url[0] = '\0';
                    const char *href_pos = ci_strstr(tag_start, "href=");
                    if (href_pos && href_pos < tag_end) {
                        const char *url_start = href_pos + 5;
                        char quote = *url_start;
                        if (quote == '"' || quote == '\'') {
                            url_start++;
                            const char *url_end = strchr(url_start, quote);
                            if (url_end && url_end <= tag_end) {
                                size_t ulen = (size_t)(url_end - url_start);
                                if (ulen < sizeof(link_url)) {
                                    strncpy(link_url, url_start, ulen);
                                    link_url[ulen] = '\0';
                                }
                            }
                        }
                    }
                    if (in_top_li && ex_count > 0) {
                        in_link = 1;
                        link_text.len = 0;
                        link_text.data[0] = '\0';
                    }
                }
            }

            p = tag_end + 1;
            continue;
        }

        if (in_top_li && ex_count > 0) {
            size_t entity_len = 0;
            const char *entity = decode_html_entity(p, &entity_len);
            if (entity) {
                if (in_link) {
                    buf_append_str(&link_text, entity);
                } else {
                    buf_append_str(&exercises[ex_count - 1].delivery_md, entity);
                }
                p += entity_len;
                continue;
            }

            char c = *p;
            DynBuffer *buf = in_link ? &link_text : &exercises[ex_count - 1].delivery_md;

            if (c == '\r') {
                p++;
                continue;
            }

            if (c == ' ' || c == '\t') {
                if (buf->len > 0 && buf->data[buf->len - 1] != ' ' &&
                    buf->data[buf->len - 1] != '\n' &&
                    buf->data[buf->len - 1] != '(' &&
                    buf->data[buf->len - 1] != '[') {
                    buf_append_char(buf, ' ');
                }
            } else if (c == '\n') {
                buf_append_char(buf, '\n');
            } else {
                buf_append_char(buf, c);
            }
        }
        p++;
    }

    buf_free(&link_text);

    for (int i = 0; i < ex_count; i++) {
        clean_markdown(&exercises[i].delivery_md);
    }

    return ex_count;
}

/* ========================================================================= */
/* Ricerca del file consegna e abbinamento con file sorgenti e binari        */
/* ========================================================================= */
static int find_consegna_file(const char *dir_path, char *out_path, size_t out_size, char *out_name, size_t name_size) {
    DIR *d = opendir(dir_path);
    if (!d) return 0;
    struct dirent *entry;
    int found = 0;

    while ((entry = readdir(d)) != NULL) {
        if (ci_strncasecmp(entry->d_name, "consegn", 7) == 0) {
            char full_path[MAX_PATH];
            snprintf(full_path, sizeof(full_path), "%s/%s", dir_path, entry->d_name);
            struct stat st;
            if (stat(full_path, &st) == 0 && S_ISREG(st.st_mode)) {
                snprintf(out_path, out_size, "%s", full_path);
                snprintf(out_name, name_size, "%s", entry->d_name);
                found = 1;
                break;
            }
        }
    }
    closedir(d);
    return found;
}

static void match_exercises_with_files(const char *dir_path, Exercise exercises[], int *p_ex_count, int max_ex) {
    int count = *p_ex_count;

    for (int i = 0; i < count; i++) {
        int num = exercises[i].num;
        char candidate_path[MAX_PATH];
        struct stat st;

        /* 1. Prova es%d.c */
        snprintf(candidate_path, sizeof(candidate_path), "%s/es%d.c", dir_path, num);
        if (stat(candidate_path, &st) == 0 && S_ISREG(st.st_mode)) {
            exercises[i].has_source = 1;
            snprintf(exercises[i].source_path, sizeof(exercises[i].source_path), "%s", candidate_path);
            snprintf(exercises[i].source_name, sizeof(exercises[i].source_name), "es%d.c", num);
        }

        /* 2. Prova es0%d.c */
        if (!exercises[i].has_source) {
            snprintf(candidate_path, sizeof(candidate_path), "%s/es0%d.c", dir_path, num);
            if (stat(candidate_path, &st) == 0 && S_ISREG(st.st_mode)) {
                exercises[i].has_source = 1;
                snprintf(exercises[i].source_path, sizeof(exercises[i].source_path), "%s", candidate_path);
                snprintf(exercises[i].source_name, sizeof(exercises[i].source_name), "es0%d.c", num);
            }
        }

        /* 3. Prova es%d_*.c (es: es3_v2.c) */
        if (!exercises[i].has_source) {
            DIR *d = opendir(dir_path);
            if (d) {
                struct dirent *ent;
                char prefix[32];
                snprintf(prefix, sizeof(prefix), "es%d_", num);
                while ((ent = readdir(d)) != NULL) {
                    if (strncmp(ent->d_name, prefix, strlen(prefix)) == 0 &&
                        strstr(ent->d_name, ".c") != NULL) {
                        snprintf(candidate_path, sizeof(candidate_path), "%s/%s", dir_path, ent->d_name);
                        if (stat(candidate_path, &st) == 0 && S_ISREG(st.st_mode)) {
                            exercises[i].has_source = 1;
                            snprintf(exercises[i].source_path, sizeof(exercises[i].source_path), "%s", candidate_path);
                            snprintf(exercises[i].source_name, sizeof(exercises[i].source_name), "%s", ent->d_name);
                            break;
                        }
                    }
                }
                closedir(d);
            }
        }

        /* Se il file sorgente esiste, leggiamo il codice e cerchiamo il binario compilato */
        if (exercises[i].has_source) {
            exercises[i].source_code = read_entire_file(exercises[i].source_path);

            char base_bin_name[MAX_PATH];
            strncpy(base_bin_name, exercises[i].source_name, sizeof(base_bin_name) - 1);
            char *dot = strrchr(base_bin_name, '.');
            if (dot) *dot = '\0';

            /* Binario eseguibile Unix / macOS */
            snprintf(candidate_path, sizeof(candidate_path), "%s/%s", dir_path, base_bin_name);
            if (stat(candidate_path, &st) == 0 && S_ISREG(st.st_mode)) {
                exercises[i].has_binary = 1;
                snprintf(exercises[i].binary_path, sizeof(exercises[i].binary_path), "%s", candidate_path);
                snprintf(exercises[i].binary_name, sizeof(exercises[i].binary_name), "%s", base_bin_name);
            }

            /* Binario Windows (.exe) */
            if (!exercises[i].has_binary) {
                snprintf(candidate_path, sizeof(candidate_path), "%s/%s.exe", dir_path, base_bin_name);
                if (stat(candidate_path, &st) == 0 && S_ISREG(st.st_mode)) {
                    exercises[i].has_binary = 1;
                    snprintf(exercises[i].binary_path, sizeof(exercises[i].binary_path), "%s", candidate_path);
                    snprintf(exercises[i].binary_name, sizeof(exercises[i].binary_name), "%s.exe", base_bin_name);
                }
            }

            /* Cartella debug dSYM (macOS) */
            snprintf(candidate_path, sizeof(candidate_path), "%s/%s.dSYM", dir_path, base_bin_name);
            if (stat(candidate_path, &st) == 0 && S_ISDIR(st.st_mode)) {
                exercises[i].has_dsym = 1;
                snprintf(exercises[i].dsym_path, sizeof(exercises[i].dsym_path), "%s", candidate_path);
            }
        }
    }

    /* Rileva eventuali altri file es*.c presenti nella cartella non previsti dalla consegna */
    DIR *d = opendir(dir_path);
    if (d) {
        struct dirent *ent;
        while ((ent = readdir(d)) != NULL) {
            if (strncmp(ent->d_name, "es", 2) == 0 && strstr(ent->d_name, ".c") != NULL) {
                int already_matched = 0;
                for (int i = 0; i < count; i++) {
                    if (exercises[i].has_source && strcmp(exercises[i].source_name, ent->d_name) == 0) {
                        already_matched = 1;
                        break;
                    }
                }
                if (!already_matched && count < max_ex) {
                    int num = atoi(ent->d_name + 2);
                    if (num <= 0) num = count + 1;
                    exercises[count].num = num;
                    buf_init(&exercises[count].delivery_md);
                    exercises[count].has_source = 1;
                    snprintf(exercises[count].source_path, sizeof(exercises[count].source_path), "%s/%s", dir_path, ent->d_name);
                    snprintf(exercises[count].source_name, sizeof(exercises[count].source_name), "%s", ent->d_name);
                    exercises[count].source_code = read_entire_file(exercises[count].source_path);
                    exercises[count].has_binary = 0;
                    exercises[count].has_dsym = 0;

                    char base_bin_name[MAX_PATH];
                    strncpy(base_bin_name, ent->d_name, sizeof(base_bin_name) - 1);
                    char *dot = strrchr(base_bin_name, '.');
                    if (dot) *dot = '\0';

                    char bin_cand[MAX_PATH];
                    snprintf(bin_cand, sizeof(bin_cand), "%s/%s", dir_path, base_bin_name);
                    struct stat st;
                    if (stat(bin_cand, &st) == 0 && S_ISREG(st.st_mode)) {
                        exercises[count].has_binary = 1;
                        snprintf(exercises[count].binary_path, sizeof(exercises[count].binary_path), "%s", bin_cand);
                        snprintf(exercises[count].binary_name, sizeof(exercises[count].binary_name), "%s", base_bin_name);
                    }
                    count++;
                }
            }
        }
        closedir(d);
    }
    *p_ex_count = count;
}

static int compare_exercises(const void *a, const void *b) {
    const Exercise *ea = (const Exercise *)a;
    const Exercise *eb = (const Exercise *)b;
    return ea->num - eb->num;
}

/* ========================================================================= */
/* Risoluzione della cartella target Laboratorio-X                          */
/* ========================================================================= */
static int resolve_target_dir(int lab_num, char *out_dir, size_t out_size) {
    char candidate[MAX_PATH];
    struct stat st;

    /* 1. Controlla ./Laboratorio-%d (se eseguito da Esercizi/) */
    snprintf(candidate, sizeof(candidate), "Laboratorio-%d", lab_num);
    if (stat(candidate, &st) == 0 && S_ISDIR(st.st_mode)) {
        snprintf(out_dir, out_size, "%s", candidate);
        return 1;
    }

    /* 2. Controlla percorso relativo dalla root del repository */
    snprintf(candidate, sizeof(candidate), "app/Appunti/1-Anno/1-Semestre/Programmazione/Esercizi/Laboratorio-%d", lab_num);
    if (stat(candidate, &st) == 0 && S_ISDIR(st.st_mode)) {
        snprintf(out_dir, out_size, "%s", candidate);
        return 1;
    }

    /* 3. Controlla se la directory corrente '.' contiene già i file */
    if (stat("consegna", &st) == 0 || stat("consegne", &st) == 0 || stat("es1.c", &st) == 0) {
        snprintf(out_dir, out_size, ".");
        return 1;
    }

    return 0;
}

static void print_usage(const char *prog_name) {
    printf("Uso: %s [numero_laboratorio] [opzioni]\n\n", prog_name);
    printf("Opzioni:\n");
    printf("  -k, --keep      Crea 'page.mdx' ma conserva i file sorgenti e binari originali\n");
    printf("  -n, --dry-run   Simula l'esecuzione senza scrivere page.mdx o eliminare file\n");
    printf("  -y, --yes       Conferma automaticamente senza richieste interattive\n");
    printf("  -h, --help      Mostra questo messaggio di aiuto\n\n");
    printf("Esempi:\n");
    printf("  %s 9\n", prog_name);
    printf("  %s Laboratorio-9\n", prog_name);
    printf("  %s 9 --keep\n", prog_name);
}

/* ========================================================================= */
/* Funzione Principale                                                       */
/* ========================================================================= */
int main(int argc, char *argv[]) {
    int lab_num = 0;
    int has_lab_num = 0;
    int opt_keep = 0;
    int opt_dry_run = 0;
    int opt_yes = 0;

    /* Parsing degli argomenti da linea di comando */
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-k") == 0 || strcmp(argv[i], "--keep") == 0) {
            opt_keep = 1;
        } else if (strcmp(argv[i], "-n") == 0 || strcmp(argv[i], "--dry-run") == 0) {
            opt_dry_run = 1;
        } else if (strcmp(argv[i], "-y") == 0 || strcmp(argv[i], "--yes") == 0) {
            opt_yes = 1;
        } else if (strcmp(argv[i], "-h") == 0 || strcmp(argv[i], "--help") == 0) {
            print_usage(argv[0]);
            return EXIT_SUCCESS;
        } else if (!has_lab_num) {
            /* Può essere un numero intero oppure 'Laboratorio-X' */
            const char *num_str = argv[i];
            if (strncmp(num_str, "Laboratorio-", 12) == 0) {
                num_str += 12;
            }
            char *endptr;
            long val = strtol(num_str, &endptr, 10);
            if (*endptr == '\0' && val > 0) {
                lab_num = (int)val;
                has_lab_num = 1;
            } else {
                fprintf(stderr, "Argomento '%s' non valido come numero di laboratorio.\n", argv[i]);
            }
        }
    }

    /* Se il numero non è stato passato, richiedilo in modo interattivo */
    if (!has_lab_num) {
        printf("Inserisci il numero del laboratorio (es. 9 per Laboratorio-9): ");
        if (scanf("%d", &lab_num) != 1 || lab_num <= 0) {
            fprintf(stderr, "Numero laboratorio non valido.\n");
            return EXIT_FAILURE;
        }
    }

    char target_dir[MAX_PATH];
    if (!resolve_target_dir(lab_num, target_dir, sizeof(target_dir))) {
        fprintf(stderr, "Errore: cartella 'Laboratorio-%d' non trovata nella directory corrente o in Esercizi/.\n", lab_num);
        return EXIT_FAILURE;
    }

    printf("\n=======================================================\n");
    printf(" Elaborazione Laboratorio-%d (cartella: %s)\n", lab_num, target_dir);
    printf("=======================================================\n");

    /* 1. Trova il file di consegna */
    char consegna_path[MAX_PATH] = {0};
    char consegna_name[MAX_PATH] = {0};
    int has_consegna = find_consegna_file(target_dir, consegna_path, sizeof(consegna_path), consegna_name, sizeof(consegna_name));

    Exercise exercises[MAX_EXERCISES];
    int ex_count = 0;

    if (has_consegna) {
        printf("[OK] File consegna rilevato: %s\n", consegna_name);
        char *html = read_entire_file(consegna_path);
        if (html) {
            ex_count = parse_consegna_html(html, exercises, MAX_EXERCISES);
            free(html);
            printf("[OK] Esercizi estratti dalla consegna: %d\n", ex_count);
        } else {
            fprintf(stderr, "[!] Impossibile leggere il file consegna '%s'.\n", consegna_path);
        }
    } else {
        printf("[!] Nessun file consegna trovato (cercato 'consegna'/'consegne').\n");
    }

    /* 2. Abbina esercizi e scansiona file sorgenti e binari */
    match_exercises_with_files(target_dir, exercises, &ex_count, MAX_EXERCISES);

    if (ex_count == 0) {
        fprintf(stderr, "Errore: nessun esercizio o file 'es*.c' trovato in '%s'.\n", target_dir);
        return EXIT_FAILURE;
    }

    /* Ordina gli esercizi in ordine numerico progressivo */
    qsort(exercises, ex_count, sizeof(Exercise), compare_exercises);

    /* 3. Riepilogo e verifica dei file corrispondenti */
    printf("\nVerifica dei file corrispondenti:\n");
    int missing_sources = 0;
    for (int i = 0; i < ex_count; i++) {
        printf("  - Es %-2d: ", exercises[i].num);
        if (exercises[i].has_source) {
            printf("[Sorgente: %-10s] ", exercises[i].source_name);
        } else {
            printf("[Sorgente: MANCANTE  ] ");
            missing_sources++;
        }

        if (exercises[i].has_binary) {
            printf("[Binario: %-8s] ", exercises[i].binary_name);
        } else {
            printf("[Binario: assente ] ");
        }

        if (exercises[i].has_dsym) {
            printf("[Debug: .dSYM]");
        }
        printf("\n");
    }

    if (missing_sources > 0) {
        printf("\n[ATTENZIONE] %d esercizio/i non hanno il file sorgente corrispondente.\n", missing_sources);
        if (!opt_yes && !opt_dry_run && isatty(fileno(stdin))) {
            printf("Vuoi procedere comunque con la generazione di page.mdx? [s/N]: ");
            char answer[16] = {0};
            if (scanf("%15s", answer) != 1 || (answer[0] != 's' && answer[0] != 'S' && answer[0] != 'y' && answer[0] != 'Y')) {
                printf("Operazione annullata dall'utente.\n");
                return EXIT_SUCCESS;
            }
        }
    }

    if (opt_dry_run) {
        printf("\n[MODALITÀ DRY-RUN] Nessun file verrà scritto o eliminato.\n");
        printf("Sarebbe stato generato: %s/page.mdx\n", target_dir);
        if (!opt_keep) {
            printf("Sarebbero stati eliminati i seguenti file originali:\n");
            if (has_consegna) printf("  - %s\n", consegna_name);
            for (int i = 0; i < ex_count; i++) {
                if (exercises[i].has_source) printf("  - %s\n", exercises[i].source_name);
                if (exercises[i].has_binary) printf("  - %s\n", exercises[i].binary_name);
                if (exercises[i].has_dsym)   printf("  - %s\n", exercises[i].dsym_path);
            }
        }
        return EXIT_SUCCESS;
    }

    /* 4. Creazione atomica di page.mdx tramite file temporaneo */
    char tmp_path[MAX_PATH];
    char mdx_path[MAX_PATH];
    snprintf(tmp_path, sizeof(tmp_path), "%s/page.mdx.tmp", target_dir);
    snprintf(mdx_path, sizeof(mdx_path), "%s/page.mdx", target_dir);

    FILE *fout = fopen(tmp_path, "w");
    if (!fout) {
        perror("Errore durante la creazione di page.mdx.tmp");
        return EXIT_FAILURE;
    }

    /* Intestazione canonica */
    fprintf(fout, "# Esercizi laboratorio lezione %d\n\n", lab_num);

    /* Generazione delle sezioni per ciascun esercizio */
    for (int i = 0; i < ex_count; i++) {
        fprintf(fout, "## Es %d\n\n", exercises[i].num);

        if (exercises[i].delivery_md.len > 0) {
            fprintf(fout, "%s\n\n", exercises[i].delivery_md.data);
        }

        if (exercises[i].has_source && exercises[i].source_code) {
            fprintf(fout, "<Spoiler>\n");
            fprintf(fout, "```c\n");

            /* Rimuove eventuali newline superflui alla fine del sorgente */
            size_t clen = strlen(exercises[i].source_code);
            while (clen > 0 && (exercises[i].source_code[clen - 1] == '\n' || exercises[i].source_code[clen - 1] == '\r')) {
                exercises[i].source_code[--clen] = '\0';
            }
            fprintf(fout, "%s\n", exercises[i].source_code);
            fprintf(fout, "```\n");
            fprintf(fout, "</Spoiler>\n\n");
        } else {
            /* Esercizio mancante o da completare */
            fprintf(fout, "<Todo\n");
            fprintf(fout, "title=\"Esercizio da completare\"\n");
            fprintf(fout, "priority=\"medium\"\n");
            fprintf(fout, ">\n");
            fprintf(fout, "Codice sorgente non presente.\n");
            fprintf(fout, "</Todo>\n\n");
        }
    }

    /* Chiusura canonica del documento */
    fprintf(fout, "---\n\n<LessonNav/>\n");

    fflush(fout);
    fclose(fout);

    /* Verifica integrità e rinomina definitiva in page.mdx */
    struct stat tmp_st;
    if (stat(tmp_path, &tmp_st) != 0 || tmp_st.st_size == 0) {
        fprintf(stderr, "Errore: creazione di page.mdx non riuscita.\n");
        unlink(tmp_path);
        return EXIT_FAILURE;
    }

    if (rename(tmp_path, mdx_path) != 0) {
        perror("Errore durante il salvataggio definitivo di page.mdx");
        unlink(tmp_path);
        return EXIT_FAILURE;
    }

    printf("\n[SUCCESSO] Documento definitivo '%s' creato con successo (%ld byte).\n", mdx_path, (long)tmp_st.st_size);

    /* 5. Eliminazione dei file originali una volta creato il documento definitivo */
    if (opt_keep) {
        printf("\n[INFO] Opzione --keep attiva: file originali conservati.\n");
    } else {
        printf("\nEliminazione file originali:\n");

        if (has_consegna) {
            if (unlink(consegna_path) == 0) {
                printf("  [OK] Rimosso: %s\n", consegna_name);
            } else {
                printf("  [!] Impossibile rimuovere %s: %s\n", consegna_name, strerror(errno));
            }
        }

        for (int i = 0; i < ex_count; i++) {
            if (exercises[i].has_source) {
                if (unlink(exercises[i].source_path) == 0) {
                    printf("  [OK] Rimosso: %s\n", exercises[i].source_name);
                } else {
                    printf("  [!] Impossibile rimuovere %s: %s\n", exercises[i].source_name, strerror(errno));
                }
            }

            if (exercises[i].has_binary) {
                if (unlink(exercises[i].binary_path) == 0) {
                    printf("  [OK] Rimosso: %s\n", exercises[i].binary_name);
                } else {
                    printf("  [!] Impossibile rimuovere %s: %s\n", exercises[i].binary_name, strerror(errno));
                }
            }

            if (exercises[i].has_dsym) {
                if (remove_dir_recursive(exercises[i].dsym_path) == 0) {
                    printf("  [OK] Rimosso: %s\n", exercises[i].dsym_path);
                } else {
                    printf("  [!] Impossibile rimuovere %s: %s\n", exercises[i].dsym_path, strerror(errno));
                }
            }
        }
    }

    /* Pulizia memoria allocata */
    for (int i = 0; i < ex_count; i++) {
        buf_free(&exercises[i].delivery_md);
        if (exercises[i].source_code) {
            free(exercises[i].source_code);
        }
    }

    printf("\nOperazione completata con successo!\n");
    return EXIT_SUCCESS;
}
