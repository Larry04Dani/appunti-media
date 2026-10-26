#include <stdio.h>

int main(void)
{
    int a, b, goal,somma = 1;
    do
    {
        scanf("%d",&a);
    }
    while(a <= 0);
    do
    {
        scanf("%d",&b);
    }
    while(b <= 0);
    goal = a/2;
    for(int i = 0; i < 2; i++)
    {
        for(int j = 2; j <= goal; j++)
        {
            if(a % j == 0)
            {   
                somma += j;
            }   
            if(somma > b)
            {
                printf("%d e %d non sono amici\n",a,b);
                return 0;
            }
        }
        if (somma != b)
        {
            printf("%d e %d non sono amici\n",a,b);
            return 0;;
        }
        a = a+b;
        b = a-b;
        a = a-b;
        somma = 1;
        goal = a/2;
    }
    printf("%d e %d sono amici!\n",a,b);
}
