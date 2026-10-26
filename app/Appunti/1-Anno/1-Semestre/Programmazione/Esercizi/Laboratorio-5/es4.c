#include <stdio.h>

int main(void)
{
    int annoI, meseI, giornoI;
    int annoF, meseF, giornoF;
    int giorni = 0;
    do
    {
        printf("Inserisci un giorno del mese\n");
        scanf("%d",&giornoI);
    }
    while(giornoI<1 || giornoI > 31);
    switch(giornoI)
    {
        case 31:
        do
        {
            printf("Inserisci un mese tra quelli che hanno 31 giorni\n");
            scanf("%d",&meseI);
        }
        while( meseI > 12 || meseI < 1 ||  meseI == 2 || meseI == 4 || meseI == 6 || meseI == 9 || meseI == 11);
        break;

        case 30:
        do
        {
            printf("Non puoi inserire febbraio\n");
            scanf("%d",&meseI);
        }
        while(meseI > 12 || meseI < 1 || meseI == 2);
        break;

        default:
        do
        {
            printf("Inserisci un mese qualunque\n");
            scanf("%d",&meseI);
        }
        while(meseI > 12 || meseI < 1);
        break;
    }

    do
    {
        printf("Inserisci un anno compreso tra il 1580 ed il 2100\n");
        scanf("%d",&annoI);
        if (giornoI == 29 && meseI == 2 && (((annoI % 100 == 0)&& annoI % 8 == 0)||((annoI % 100 != 0)&& annoI % 4 == 0)))
        {
            printf("L'anno selezionato è bisestile, il giorno indicato non esiste\n");
            annoI = 0;
        }
    }
    while(annoI > 2100 || annoI < 1582);
    printf("\nHai scelto il giorno: %d/%d/%d\n\n",giornoI,meseI,annoI);
    
    do
    {
        printf("Inserisci un giorno del mese\n");
        scanf("%d",&giornoF);
    }
    while(giornoF<1 || giornoF > 31);
    switch(giornoF)
    {
        case 31:
        do
        {
            printf("Inserisci un mese tra quelli che hanno 31 giorni\n");
            scanf("%d",&meseF);
        }
        while( meseF > 12 || meseF < 1 ||  meseF == 2 || meseF == 4 || meseF == 6 || meseF == 9 || meseF == 11);
        break;

        case 30:
        do
        {
            printf("Non puoi inserire febbraio\n");
            scanf("%d",&meseF);
        }
        while(meseF > 12 || meseF < 1 || meseF == 2);
        break;

        default:
        do
        {
            printf("Inserisci un mese qualunque\n");
            scanf("%d",&meseF);
        }
        while(meseF > 12 || meseF < 1);
        break;
    }

    do
    {
        printf("Inserisci un anno compreso tra il 1580 ed il 2100\n");
        scanf("%d",&annoF);
        if (giornoF == 29 && meseF == 2 && (((annoF % 100 == 0)&& annoF % 8 == 0)||((annoF % 100 != 0)&& annoF % 4 == 0)))
        {
            printf("L'anno selezionato è bisestile, il giorno indicato non esiste\n");
            annoF = 0;
        }
    }
    while(annoF > 2100 || annoF < annoI);
    printf("\nHai scelto il giorno: %d/%d/%d\n\n",giornoF,meseF,annoF);
    
    
}
