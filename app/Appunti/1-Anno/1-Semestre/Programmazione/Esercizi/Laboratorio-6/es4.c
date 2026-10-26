#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
    srand(time(NULL));
    int moneta, consec;
    while(consec < 5)
    {
        consec = 0;
        moneta = rand()%2;
        while(rand()%2 == moneta)consec++;
    }
    if (moneta == 0)printf("testa\n");
    else printf("croce\n");
}
