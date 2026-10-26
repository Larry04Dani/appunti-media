#include <stdio.h>

int main(void)
{
    int N = 0;
    while (N < 3 || N > 33)
    {
        printf("inserisci un numero compreso tra 3 e 33\n");
        scanf("%d",&N);
    }
    for(int i = 1 ;i <= N; i++)
    {
        for(int j = 0; j < i; j++)
        {
            printf("*");
        }
        printf("\n");
    }

    printf("\n"); // ---------------------------------------

    for(int i = 0; i <N ; i++)
    {
        for(int j = N; j > i ; j--)
        {
            printf("*");
        }
    printf("\n");
    }

    printf("\n"); // --------------------------------------

    for(int i = 0; i <N ; i++)
    {
        for(int j = N; j > 0 ; j--)
        {
            if (N - j < i)
            {
                printf(" ");
            }
            else
            {
                printf("*");
            }
        }
    printf("\n");
    }

    printf("\n"); // --------------------------------------
    
    for(int i = 0; i <N ; i++)
    {
        for(int j = 0; j <= N ; j++)
        {
            if (N - j <= i)
            {
                printf("*");
            }
            else
            {
                printf(" ");
            }
        }
    printf("\n");
    }

    printf("\n"); // --------------------------------------

    
    



}
