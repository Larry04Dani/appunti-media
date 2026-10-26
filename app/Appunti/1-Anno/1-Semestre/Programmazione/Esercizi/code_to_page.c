#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

#include <sys/stat.h>
#include <sys/types.h>

#define MAX_PATH 512
int main (int argc, char *argv[])
{
    int param_id = 0;
    int has_param = 0;
    
    if (argc >= 2)
    {
        char *endptr;
        long val = strtol(argv[1], &endptr, 10);
        if (*endptr == '\0')
        {
            param_id = val;
            has_param = 1;
        }
        else
        {
            printf("L'argomento '%s' non è un numero intero, con un intero è possibile indicare la cartella dove sono presenti i codici\n",argv[1]);
        }
    }
    char cartella_target[MAX_PATH];
    if (has_param)
    {
        snprintf(cartella_target, sizeof(cartella_target), "Laboratorio-%d", param_id);
    }
    else
    {
        struct stat st;
        k = 0;
        do
        {
            k++;
            snprintf(cartella_target, sizeof(cartella_target), "Laboratorio-%d", k);
        }
        while(stat(cartella_target, &st) == 0 && S_ISDIR(st.st_mode));
    }

    const char *nome_code = "es.c";
    const char *nome_page = "page.mdx";

    char path_sorgente[MAX_PATH];
    char path_dest[MAX_PATH];

    struct stat st;
    int cartella_esistente = (stat(cartella_target, &st) == 0 && S_ISDIR(st.st_mode));

    if (has_param && cartella_esistente)
    {
        snprintf(path_sorgente, sizeof(pathsorgente), "%s%s", cartella_target, nome_code);
        FILE *test // Da implementare la ricerca degli esercizi, la funzione di copia
    }

    FILE *OutFile = fopen("page.mdx","w");
    if (Outfile == NULL)
    {
        perror("Errore nell'apertura/creazione del file");
        return EXIT_FAILURE;
    }

    fprintf(OutFile, "# Laboratorio %d\n",);


    fclose(OutFile);

    printf("Pagina creata\n");
    return EXIT_SUCCESS;
    
}
