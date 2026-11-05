#include <stdio.h>
int perfetto(int x)
{
    int somma = 0;
    for(int i = 1; i <= x/2;i++)
    {
        x % i == 0 ? somma += i : 0;
    }
    if (somma == x)return 1;
    return 0;
}

int main(void)
{
    for (int i = 1; i < 10000 ; i++)
    {
        perfetto(i) ? printf("%d\n",i) : 0 ;
    }
}
