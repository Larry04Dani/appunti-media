#include <stdio.h>

#define LEN 1000

int CollatzLen(int n)
{
    int len = 0;
    while(n != 1)
    {
        n = n % 2 == 0 ? n/2 : 1 + (n * 3);
        len++;
    }
    return len;
}

int main()
{
    int vec[LEN];
    int len, index, max = 0;
    for(int i = 0; i < LEN; i++)
    {
        len = CollatzLen(i+1);
        vec[i] = len;
        if (max < len)
        {
            max = len;
            index = i;
        }
    }
    for(int i = index; i < LEN; i++)
    {
        if(CollatzLen(i) == max)
        {
            printf("%d ",i);
        }
    }
}
