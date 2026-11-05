#include <stdio.h>

#include <stdlib.h>
#include <time.h>
#define LEN 35

void generaVettore(int vec[], int dim)
{
    for(int i = 0; i < dim; i++)
    {
        vec[i] = rand()%71 + 15;
    }
}

void mostraVettore(int vec[], int dim)
{
    for(int i = 0; i < dim; i++)
    {
        if(i % 7 == 0)
        {
            printf("\n");
        }
        printf("%d ",vec[i]);
    }
    printf("\n");
}

int mediaVettore(int vec[], int dim)
{
    int media = 0;
    for(int i = 0; i < dim; i++)
    {
        media += vec[i];
    }
    return media /= dim;
}

int pariVettore(int vec [], int dim)
{
    int par = 0;
    for(int i = 0; i < dim; i++)
    {
        if(vec[i] % 2 == 0)par++;
    }
    return par;
}

int minVettore(int vec[], int dim)
{
    int min = vec[0];
    int index;
    for (int i = 1; i < dim; i++)
    {
        if(vec[i] < min)
        {
            min = vec[i];
            index = i;
        }
    }
    return index;
}

int consecVettore(int vec[], int dim)
{
    int prec = vec[0];
    for(int i = 1; i < dim; i++)
    {
        if(vec[i] == prec) return i-1;
        prec = vec[i];
    }
    return -1;
}

int distVettore(int vec[], int dim)
{
    for(int i = 0; i < dim; i++)
    {
        for(int j = 0; j < dim; j++)
        {
            if(vec[i] == vec[j]) return 0;
        }
    }
    return 1;
}


int main(void)
{
    srand(time(NULL));
    int vec[LEN];
    generaVettore(vec, LEN);
    printf("Il vettore risultante è il seguente: \n");
    mostraVettore(vec, LEN);
    printf("\nLa media del vettore é : %d\n",mediaVettore(vec, LEN));
    printf("Il vettore contiene: %d numeri pari\n", pariVettore(vec, LEN));
    printf("Il Valore minimo del vettore è nell'indice: %d\n", minVettore(vec, LEN));
    consecVettore(vec, LEN) == -1 ? printf("Il vettore non contiene numeri consecutivi\n") : printf("Sono presenti due numeri consecutivi, controlla l'indice: %d\n",consecVettore(vec, LEN));
    distVettore(vec, LEN) ? printf("Il vettore non contiene numeri ripetuti\n") : printf("Il vettore contiene numeri ripetuti\n");
}
