#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define ROWS 3
#define COLS 4

void genMatrix(int a[ROWS][COLS], int r, int c)
{
    for(int i = 0; i < r; i++)
    {
        for(int j = 0; j < c; j++)
        {
            a[i][j] = rand()%21 - 10;
        }
    }
}
void printMatrix(int a[ROWS][COLS], int r, int c)
{
    for(int i = 0; i <= r; i++)
    {
        printf("%3d ",i);
        for(int j = 0; j < c; j++)
        {
            i ? printf("%3d",a[i-1][j-1]) : printf("%3d",j+1);
        }
    printf("\n");
    }
    printf("\n2");
}
void checkRowSum(int a[ROWS][COLS], int r, int c)
{
    int somma = 0;
    for(int i = 0; i < r; i++)
    {
        for(int j = 0; j < c; j++)
        {
            somma += a[i][j];
        }
        if(somma == 0)
        {
            printf("%d | ",i);
            for(int k = 0; k < c; k++)
            {
                printf("%3d",a[i][k]);
            }
            printf("\n");
        }
        somma = 0;
    }
}
int main()
{
    srand(time(NULL));
    int *matrix[ROWS][COLS];
    genMatrix(matrix,ROWS,COLS);
    printMatrix(matrix,ROWS,COLS);
    checkRowSum(matrix,ROWS,COLS);
}
