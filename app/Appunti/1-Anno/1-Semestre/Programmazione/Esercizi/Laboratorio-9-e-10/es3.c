#include <stdio.h>

#define LEN 999

void Crivello(int C[], int n)
{
    for(int i = 0; i < n; i++)
    {
        C[i] = 1;
    }
    for(int i = 0; i < n; i++)
    {
        if (C[i] == 1)
        {
            printf("%d\n", i+2);
            for(int j = 2; j < n ; j += i+2)
            {
                C[j] = 0;
            }
        }
    }

}

int main()
{
    int vec[LEN];
    Crivello(vec, LEN);
}
