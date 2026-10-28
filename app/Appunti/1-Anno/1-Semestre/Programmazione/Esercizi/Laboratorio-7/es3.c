#include <stdio.h>


int fibonacci(int n) {
    if (n == 0) return 0;
    else if (n == 1) return 1;
    else return fibonacci(n - 1) + fibonacci(n - 2);
}


int main()
{
    int n;
    do
    {
        printf("inserisci un numero naturale\n");
        scanf("%d",&n);
        for (int i = 1; fibonacci(i) <= n; i++)
        {
            if (fibonacci(i) == n)printf("Il valore %d è il numero di Fibonacci corrispondente a fib(%d)",n,i);
        }

    }
    while (n!=0);
}
