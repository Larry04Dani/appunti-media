#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define LEN 100

int baricentri(int v[],int nBar[], int len)
{
    int somma = 0, med = 0;
    int kbar = 0;

    // Calcolo la somma di tutti gli indici del vettore
    for(int i = 0; i < len; i++)
    {
        somma += v[i];
    }
    printf("La somma è: %d\n",somma);
    // Se la somma complessiva è dispari non esiste nessun baricentro
    if(somma%2 != 0)return 0;

    for(int i = 0;  i< len; i++)
    {
        med += v[i];
        if(med == somma/2)
        {
            nBar[kbar] = i;
            kbar++;
            printf("Siccome med vale: %d e somma vale %d (la metà vale %d), l'indice è:\n",med,somma,somma/2);
        }
    }
    return kbar;
}

int main()
{
    srand(time(NULL));

    int v[LEN];
    int nBar[LEN] = {0};
    int k = 0;

    for (int i = 0; i < LEN; i++)
    {
        v[i] = rand()%11 - 5;
        if(i%10 ==0) printf("\n");
        printf("%3d",v[i]);
    }
    printf("\n\n");
    if((k = baricentri(v, nBar, LEN)))
    {
        printf("I baricentri sono: %d, ovvero:\n\n",k);
        for (int i = 0; i < k; i++)
        {
            printf("%d ",nBar[i]);
        }
    }
    else
    {
        printf("Il vettore non ha baricentri");
    }


    
}

