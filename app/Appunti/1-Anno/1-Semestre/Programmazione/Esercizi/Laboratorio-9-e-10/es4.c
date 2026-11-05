#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define SIZE 100

int Search(int v[], int n, int key)
{
    for(int i = 0; i < n; i++)
    {
        if(v[i] == key)
        return i;
    }
    return -1;
}
void genVector(int v[], int n)
{
    for(int i = 0; i < n; i++)
    {
        v[i] = rand()%100 + 1;
        printf("%d ",v[i]);
    }
    printf("\n\n");
}

int main()
{
    srand(time(NULL));
    int v[SIZE];
    int key, index;
    genVector(v, SIZE);
    
    do
    {
        printf("Inserisci un numero da tra 1 e 100\n");
        scanf("%d",&key);
    }
    while(key < 1 || key > 100);
    index = Search(v, SIZE, key);
    if (index == -1)printf("Il numero non è nella lista\n");
    else printf("il numero è in posizione %d\n", index);
}
