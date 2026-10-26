#include <stdio.h>
#include <math.h>

int main(void)
{
    int N, goal, somma = 1;
    printf("Inserisci un numero\n");
    do
    {
    scanf("%d",&N);
    }
    while(N <= 0);
    goal = N/2;
    for(int i = 2; i <= goal; i++)
    {
        if(N % i == 0)
        {
            somma +=i;
        }
        if (somma > N)break;
    }
    if(somma == N)printf("Il numero %d è perfetto!\n",N);
    else printf("Il numero %d non è perfetto\n",N);
}
