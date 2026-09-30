#include <stdio.h>

int main(void)
{
    int a, contatore = 0;
    printf("Inserisci un numero a 5 cifre\n");
    scanf("%d",&a);
    while (a < 10000 || a > 99999)
    {
        printf("Il numero non è valido\n");
        scanf("%d",&a);
    }
    while (contatore < 5)
    {
        printf("%d\n",a%10);
        a = a/10;
        contatore++;
    }
}
