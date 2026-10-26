#include <stdio.h>

int main(void)
{
    int N = 500;
    int sq_cat1, sq_cat2;
    long int sq_ipo;
    int cont = 0;
    long int lx, rx, guess, last_guess;
    
    int iterazioni = 0;
    for(int i = 1; i <= N; i++)
    {
        for(int j = N ; j >= i ; j--)
        {
            sq_cat1 = i*i;
            sq_cat2 = j*j;
            sq_ipo = sq_cat1 + sq_cat2;
            if (sq_ipo > N*N)continue;
            lx = 1;
            rx = sq_ipo/2;
            guess = rx/2;
            last_guess = guess - 1;
            while( last_guess != guess)
            {   
                iterazioni++;
                last_guess = guess;
                if(guess * guess < sq_ipo)
                {
                    lx = guess;
                    guess = (lx + rx)/2;
                }
                else if(guess * guess > sq_ipo)
                {
                    rx = guess;
                    guess = (rx + lx)/2;
                }
                else if(guess * guess == sq_ipo)
                {
                    cont++;
                    printf("Trovata una terna di valori valida: %d, %d, %ld\n",i,j,guess);
                    break;
                }
            }
        }
    }
    printf("Il numero di triangoli trovati è: %d\n", cont);
    printf("Sono state eseguite %d iterazioni\n", iterazioni);
}
