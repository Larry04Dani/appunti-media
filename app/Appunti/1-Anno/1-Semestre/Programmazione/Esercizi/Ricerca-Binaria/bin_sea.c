#include <stdio.h>

int main(void)
{
    int sample = 100;
    int lx = 1, rx = sample;
    int location = 12;
    int debug = 0;

    printf("Sample: ");
    scanf("%d",&sample);
    printf("Location: ");
    scanf("%d",&location);
    int guess = sample/2; // 50

    while(guess != location)
    {
        //debug++;
        //if(debug >10)break;
        if (guess < location)
        {
            printf("Il numero che cerchi è maggiore di %d\n", guess);
            lx = guess;
            guess = (rx+lx)/2;
        }
        else if (guess > location)
        {
            printf("Il numero che cerchi è minore di %d\n", guess);
            rx = guess;
            guess = (rx+lx)/2;
        }
    }
    printf("Trvato, il numero che cerchi è %d", guess);


}
