#include <stdio.h>

int Collatz(int x)
{
    int len = 0;
    while(x !=1)
    {
        x = x % 2 == 0 ? x / 2 : x * 3 + 1;
        len++;
    }
    return len;
}

int main(void)
{
    int maxL = 0, minN = 0;
    for (int i = 1; i < 1000; i++)
    {
        if (Collatz(i) > maxL)
        {
            maxL = Collatz(i);
            minN = i;
        }
    }
    printf("Lunghezza massima: %d\n Numero più piccolo: %d\n",maxL,minN);
}

