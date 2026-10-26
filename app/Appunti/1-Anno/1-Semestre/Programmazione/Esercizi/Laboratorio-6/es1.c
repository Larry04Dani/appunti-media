#include <stdio.h>

int main(void)
{
    double a,b,c;
    char operatore;

    printf("inserisci il primo numero dell'operazione\n");
    scanf("%lf",&a);

    printf("inserisci '*' per eseguire un prodotto oppure '+' per eseguire una somma\n");
    scanf(" %c",&operatore);

    printf("inserisci il secondo numero dell'operazione\n");
    scanf("%lf",&b);

    if (operatore == '*') c = a*b;
    else if (operatore == '+') c = a+b;
    else
    {
        printf("operatore non riconosciuto\n");
        return 0;
    }
    printf("Il risultato è %lf\n",c);
}
