#include <stdio.h>


int fibonacci(int n) {
    if (n == 0) return 0;
    else if (n == 1) return 1;
    else return fibonacci(n - 1) + fibonacci(n - 2);
}


int main()
{
    int n, inFib = 0;
    do
    {
        printf("inserisci un numero naturale\n");
        scanf("%d",&n);
        for (int i = 1; fibonacci(i)<= n; i++)
        {
            if (fibonacci(i) == n) inFib = i;        
        }
    inFib ? printf("Il valore %d è il numero di Fibonacci corrispondente a fib(%d)\n",n,inFib) : printf("Il valore %d non è un numero di Fibonacci\n",n);
    inFib = 0;
;

    }
    while (n!=0);
}
