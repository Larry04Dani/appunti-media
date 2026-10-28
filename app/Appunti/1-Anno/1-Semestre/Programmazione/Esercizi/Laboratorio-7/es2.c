#include <stdio.h>
#include <math.h>

int primo(int x)
{
    for(int i = 2; i <= (int)sqrt(x) ; i++)
    {
        if (x % i == 0)
        return 0;
    }
    return 1;
}
int main(void)
{
    int k = 0;
    for(int i = 1; i < 10000; i++)
    {
        if(primo(i))k++;
    }
    printf("%d\n",k);
}
