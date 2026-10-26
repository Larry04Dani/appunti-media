#include <stdio.h>

int main(void)
{
    int n;
    printf("inserisci un numero positivo\n");
    do scanf("%d",&n);
    while(n<2);
    
    while(n != 1)
    {
        if (n % 2 ==0)n/=2;
        else n = n * 3 + 1;
        printf("%d\n",n);
    }
}
