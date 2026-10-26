#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
    int pos=0,neg=0,zer=0;
    int par=0,dis=0;
    int prec=200,cons=0;
    int x;

    srand(time(NULL));

    for(int i = 0; i < 10000 ; i++)
    {
        x = rand()%201-100;
        if(x > 0)pos++;
        else if(x==0)zer++;
        else neg++;

        if (x%2 == 0) par++;
        else dis++;

        if(x == prec)cons++;
        prec=x;
    }
    printf("Numeri negativi: %d\nNumeri positivi: %d\nZeri: %d\nNumeri pari: %d\nNumeri dispari: %d\nNumeri consecutivi: %d\n",pos,neg,zer,par,dis,cons);
}
