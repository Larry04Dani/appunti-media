#include <stdio.h>

void stampaRiga(char simb, int lung)
{
    for(int i = 0; i < lung; i++)
    {
        printf("%c",simb);
    }
}

int main(void)
{
    int lung;
    char simb = '*';
    printf("Inserisci la lunghezza dei vari triangoli\n");
    scanf("%d",&lung);
    

/*  TRIANGOLO 1
     ---------
    |*        |
    |**       |
    |***      |
     ---------
*/
    for(int i = 0; i < lung; i++)
    {
        stampaRiga(simb,i+1);
        printf("\n");
    }
    printf("\n");
/* TRIANGOLO 2
    ---------
   |***      |
   |**       |
   |*        |
    ---------
*/
    for(int i = lung; i > 0; i--)
    {
        stampaRiga(simb,i);
        printf("\n");
    }
    printf("\n");
/* TRIANGOLO 3
    --------
   |***     |
   | **     |
   |  *     |
    --------
*/
    for(int i = 0; i < lung; i++)
    {
        stampaRiga(' ', i);
        stampaRiga(simb, lung - i);
        printf("\n");
    }
    printf("\n");
/* TRIANGOLO 4
    --------
   |  *     |
   | **     |
   |***     |
    --------
*/
    for(int i = 1; i <= lung; i++)
    {
        stampaRiga(' ', lung - i);
        stampaRiga(simb, i);
        printf("\n");
    }
    printf("\n");
/* TRIANGOLO 5
    --------
   |  *     |
   | ***    |
   |*****   |
    --------
*/
    for(int i = 0; i < lung; i++)
    {
        stampaRiga(' ', lung - i);
        stampaRiga(simb, 2 * i + 1);
        printf("\n");
    }
    printf("\n");
}
