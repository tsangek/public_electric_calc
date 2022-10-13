// Поиск в исходном файле массива значений по идентификатору
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int clrstr(char *str);
//---------------------------------------------------------------------------
// Поиск в исходном файле массива значений по идентификатору
int name_Trakt(FILE *f, const char *x,int cur,long int *offset)
 // *f - указатель на файл исходных данных
 // *x - текстовая идентификация массива
{
char y[256],z[16];
int i;
//long offset=0L;

i=fseek(f,*offset,cur);
while (fgets(y,256,f)!=NULL)
        {
        for(i=0; i<=9; i++)
                { if(y[i]=='=' || y[i]==';' ) break; z[i]=y[i]; }
//        z[i]=';'; i++;
        z[i]='\0';
        clrstr(z); //очистка начала строки от пробелов
        if (strcmp(z,x)==0) {*offset=ftell(f); return 0;}
        }
*offset=0;
return(-1);
}
//---------------------------------------------------------------------------

// Поиск в исходном файле массива значений по идентификатору
int wrfisx_Trakt(FILE *f, const char *x,int n,long int offset,double *w)
 // *f - указатель на файл исходных данных
 // *x - текстовая идентификация массива
 // n - кол-во вводимых элементов массива
 // *w - массив значений
{
char y[1024], z[11];
int i,j,i1;
double d;
//long offset=0L;
//d=999.999;
//for(i=0; i<100; i++)y[i]=z[i]=' ';
i=fseek(f,offset,0);
while (fgets(y,1024,f)!=NULL)
        {
        for(i=0; i<=9; i++)
                { if(y[i]=='=') break; z[i]=y[i]; }
        z[i]='\0'; i++;
        clrstr(z); //очистка начала строки от пробелов
        if (strcmp(z,x)==0)
                {
                printf("%s",y);
                for(j=0; j<n; j++)
                        {
                        for(i1=0; i1<=50; i1++)
                        { if(y[i+i1]==';') break; z[i1]=y[i+i1]; }
                        z[i1]='\0'; i+=i1+1;
                        //clrstr(z); //очистка начала строки от пробелов
                        w[j]=atof(z);
                        }
                return 0;
                }
        }
printf("%s не найдено\n",x);
return(-1);
}

//---------------------------------------------------------------------------
int sdlch(char *str,int pos,int n)
{
int i=0,j;
while(i++<n)
	{
	j=pos;
	while ((*(str+j)=*(str+j+1))!=0) j++;
	}
return(0);
}

//---------------------------------------------------------------------------
int clrstr(char *str)
{
int i=0;
while(*(str+i)!=0)
  if (*(str+i)<33) sdlch(str,i,1);
  else i++;
return 0;
}
