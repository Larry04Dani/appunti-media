#include <stdio.h>
#include <math.h>

int main (void)
{
    int N;
    scanf("%d",&N);
    int goal = sqrt(N);
    for(int i = 2; i < goal; i++)
    {
        if(N % i == 0)
        {
            printf("%d : %d = %d ",N,i,N/i);
            printf("Il numero %d non è primo\n", N);
            return 0;//Termina direttamente l'esecuzione del programma
        }
    }
    printf("Il numero %d è primo", N);
}
