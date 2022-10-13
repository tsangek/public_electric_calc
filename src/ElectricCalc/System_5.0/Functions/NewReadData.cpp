#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <iostream>

int name_Trakt(FILE *f, const char *x,int cur,long int *offset);     //установка сдвига в файле по искомому названию
int wrfisx_Trakt(FILE *f, const char *x,int n,long int offset,double *w);  //поиск числа по названию
int clrstr(char *str);                                             //очистка строки от пробелов
int obrstr(char *str,int n,double *w);                             //распознавание чилсла в прочитанной строке


//——————————————————————————————————————————————————————————————————————————————
//чтение адресса файла из файла
int name_File(FILE *f, const char *x, char *w, long offset)
 // *f - указатель на файл исходных данных
 // *x - текстовая идентификация массива
 // n - кол-во вводимых элементов массива
 // *w - массив значений
{
char y[1024];
int i,j,i1;
double d;

i=fseek(f,offset,0);
while (fgets(y,1024,f)!=NULL)
		{
		for(i=0; i<=9; i++)
				{ if(y[i]=='=') break; w[i]=y[i]; }
		w[i]='\0'; i++;
		clrstr(w); //очистка начала строки от пробелов
		if (strcmp(w,x)==0)
                {
                printf("%s",y);
				for(i1=0; i1<256; i1++)
				{ if(y[i+i1]==';') break; w[i1]=y[i+i1]; }
				w[i1]='\0'; i+=i1+1;

				return 0;
				}
		}
		printf("%s не найдено\n",x);
return(1);
}

//——————————————————————————————————————————————————————————————————————————————
//чтение данных из файла в массив
int NewReadHeader(FILE *f, double *HeaderData)
{
	int ier;
	long int offset;                                                    //указатель на начало файла
	offset=0L;

	ier=wrfisx_Trakt(f,"Uzel_kol",	1,offset,&HeaderData[0] );			//количество узлов
	if (ier!=0) return 1;
	ier=wrfisx_Trakt(f,"Rebro_kol",	1,offset,&HeaderData[1] );			//количество труб
	if (ier!=0) return 2;
//	ier=wrfisx_Trakt(f,"Ncikl",		1,offset,&HeaderData[2] );
//	if (ier!=0) return 3;
//	ier=wrfisx_Trakt(f,"eps_mull",	1,offset,&HeaderData[3] );
//	if (ier!=0) return 4;
//	ier=wrfisx_Trakt(f,"eps_iter",	1,offset,&HeaderData[4] );
//	if (ier!=0) return 5;
	ier=wrfisx_Trakt(f,"dt_mks",	1,offset,&HeaderData[5] );          //шаг по времени
	if (ier!=0) return 6;
	ier=wrfisx_Trakt(f,"N_slojov",	1,offset,&HeaderData[6] );          //кол-во временных слоёв
	if (ier!=0) return 7;
	ier=wrfisx_Trakt(f,"faza0",	1,offset,&HeaderData[7] );              //начальная фаза
	if (ier!=0) return 8;

	return 0;
}


