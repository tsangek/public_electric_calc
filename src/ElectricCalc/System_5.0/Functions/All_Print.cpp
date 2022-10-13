#include <stdio.h>
#include <math.h>

#include "..\Classes\Uzel\Class_Uzel_Elektrik.h"							//класс узлов
#include "..\Classes\Rebro\Class_Rebro_Elektrik.h"							//класс рёбер

//——————————————————————————————————————————————————————————————————————————————
//печать конфигурации узлов:
//№узла	Ранг	РеброСосед0	РеброСосед1	...
int Print_Uzel_config(FILE *f, Class_Uzel_Elektrik **Class_Uzel, int Uzel_kol)
{
int i,j;
int rang;

for (i = 0; i < Uzel_kol; i++)
{
	rang = Class_Uzel[i]->Rang_uzla;
	fprintf(f,"%d\t %d\t \t",i,rang);
	for (j = 0; j < rang; j++)
	{
		fprintf(f,"%d\t",Class_Uzel[i]->Uzel_Sosed_Rebro_num[j]);
	}
	fprintf(f,"\n");
}
fprintf(f,"\n");
return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//печать заголовка:
//файл 	напржений: 	t	EDS1	EDS2	EDS3	U0	U1	U2 ...
//файл 		токов: 	t	EDS1	EDS2	EDS3	I0	I1	I2 ...
int Print_current_header2(FILE *f1, FILE *f2, int Uzel_kol, int Rebro_kol,
		double t, Class_Uzel_Elektrik **Class_Uzel, Class_Rebro_Elektrik **Class_Rebro)
{
int i;

fprintf(f1,"t     \t EDS1   \t EDS2   \t EDS3   \t");
for (i = 0; i < Rebro_kol; i++) //перебор ребер
{
	fprintf(f1,"U%d     \t",i);
//	fprintf(f1,"I%d     \t",i);
}
fprintf(f1,"\n");


fprintf(f2,"t     \t EDS1   \t EDS2   \t EDS3   \t");
for (i = 0; i < Rebro_kol; i++) //перебор ребер
{
	fprintf(f2,"I%d     \t",i);
}

fprintf(f2,"\n");


return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//печать данных:
//файл 	напржений: 	t	EDS1	EDS2	EDS3	U0	U1	U2 ...
//файл 		токов: 	t	EDS1	EDS2	EDS3	I0	I1	I2 ...
int Print_current_data2(FILE *f1, FILE *f2, int Uzel_kol, int Rebro_kol, double t,
		Class_Uzel_Elektrik **Class_Uzel, Class_Rebro_Elektrik **Class_Rebro,
		double *vector_F)
{
int i;

fprintf(f1,"%7.10f \t",(double)t);
fprintf(f1,"%7.10f \t",(double)Class_Rebro[0]->EDS_nonst);
fprintf(f1,"%7.10f \t",(double)Class_Rebro[1]->EDS_nonst);
fprintf(f1,"%7.10f \t",(double)Class_Rebro[2]->EDS_nonst);

for (i = 0; i < Rebro_kol; i++) //перебор узлов
{
	fprintf(f1,"%7.15f     \t",(double)Class_Rebro[i]->Find_U_from_I(vector_F[i]));
//	fprintf(f1,"%7.15f \t",(double)vector_F[i]);
}

fprintf(f1,"\n");

fprintf(f2,"%7.10f \t",(double)t);
fprintf(f2,"%7.10f \t",(double)Class_Rebro[0]->EDS_nonst);
fprintf(f2,"%7.10f \t",(double)Class_Rebro[1]->EDS_nonst);
fprintf(f2,"%7.10f \t",(double)Class_Rebro[2]->EDS_nonst);

for (i = 0; i < Rebro_kol; i++) //перебор узлов
{
	fprintf(f2,"%7.1f \t",(double)vector_F[i] * (double)Class_Rebro[i]->Find_U_from_I(vector_F[i]));
}

fprintf(f2,"\n");


return 0;
}


