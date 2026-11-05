#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <time.h>

#define SIZE 15

int rigaTaglio(int a[SIZE][SIZE], int *somma)
{
    int leftsum = 0, rightsum = 0;
    for(int i = 0; i < SIZE; i++)
    {
        for(int j = 0; j < SIZE; j++)
        {
            leftsum += a[i][j];
        }
        for(int j = SIZE; j > 0; j--)
        {
            rightsum +=  a[i][j];
            leftsum -= a[i][j];
            if (abs(rightsum - leftsum) <= 10)
            {
                *somma = rightsum;
                return i;
            }
        }
        leftsum = 0;
        rightsum = 0;
    }
    return -1;
}


int main()
{
    int somma, index;
    srand(time(NULL));
    int m[SIZE][SIZE];
    for(int i = 0; i < SIZE; i++)
    {
        for(int j = 0; j < SIZE; j++)
        {
            m[i][j] = rand()%191 - 17;
            printf("%4d",m[i][j]);
        }
        printf("\n");
    }
    index = rigaTaglio(m, &somma);
    if (index  == -1)printf("La riga che cerchi non esiste\n");
    else printf("La riga taglio è la numero: %d\nLa somma calcolata è: %d\n", index, somma);
}
