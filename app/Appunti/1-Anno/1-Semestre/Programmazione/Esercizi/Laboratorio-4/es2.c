#include <stdio.h>


int main(void)
{
    int N = 0, k= 0;

    while(N<3 || N>33) //Classico controllo per assicurarsi che il numero inserito sia compreso nell'intervallo richiesto
    {
        printf("Inserisci un numero compreso tra 3 e 33\n");
        scanf("%d",&N);
    }

    for(int i = 1; i <= N ; i++) //
    {
        for(int j = 0; j < i; j++)
        {
            k++;
            printf("%.3d ", k);
        }
        printf("\n");
    }
}
