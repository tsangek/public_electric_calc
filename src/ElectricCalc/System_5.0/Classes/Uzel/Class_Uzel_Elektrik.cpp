#include "Class_Uzel_Elektrik.h"

//——————————————————————————————————————————————————————————————————————————————
//Конструктор
Class_Uzel_Elektrik::Class_Uzel_Elektrik()
{
}

//——————————————————————————————————————————————————————————————————————————————
//Псевдоконструктор (инициализация) - получение уникальных данных узла и неизменных параметров класса.
//В данной программе каждый узел = своему экземпляру класса.
int Class_Uzel_Elektrik::Ini(Class_Rebro_Elektrik **Class_Rebro_in,
		Class_Uzel_Elektrik **Class_Uzel_in, int Uzel_num_in, int Rebro_kol,
		int Active_Rebro_kol_in)
{
	 int j;

	 Class_Uzel			= Class_Uzel_in;            //массив узлов
	 Class_Rebro		= Class_Rebro_in;           //массив рёбер
	 Uzel_num			= Uzel_num_in;				//номер данного узла
	 Active_Rebro_kol	= Active_Rebro_kol_in;      //Кол-во активных рёбер

//——————————————————————————————————————————————————————————————————————————————
//Анализ рёбер, поиск соседей.
	 Rang_uzla=0;                        	//инициализация ранга узла (кол-ва соседей) нулём

	 for (j = 0; j < Rebro_kol; j++)     	//перебирается массив труб
	 {
		 if(Class_Rebro[j]->pr_diod_nonst==0) continue;   //если ребро отключено - пропуск
	 //______________________________________________
	 //и ищется совпадения номера данного узла
		   if (Uzel_num == Class_Rebro[j]->Uzel_vh_nonst)			//с узлом начала трубы
		   {
				Uzel_Sosed_Uzel_num[Rang_uzla]=Class_Rebro[j]->Uzel_vyh_nonst;	//номер узла соседа
				Uzel_Sosed_Rebro_pr_vh[Rang_uzla]=true;                     //вход (1) или выход (0)
				Uzel_Sosed_Rebro_num[Rang_uzla]=j;                          //номер ребра к соседнему узлу
				Rang_uzla++;                                                		//увеличиваем ранг узла
		   }
		   if (Uzel_num == Class_Rebro[j]->Uzel_vyh_nonst)			//или узлом конца трубы
		   {
				Uzel_Sosed_Uzel_num[Rang_uzla]=Class_Rebro[j]->Uzel_vh_nonst;	//номер узла соседа
				Uzel_Sosed_Rebro_pr_vh[Rang_uzla]=false;					//вход (1) или выход (0)
				Uzel_Sosed_Rebro_num[Rang_uzla]=j;						//номер ребра к соседнему узлу
				Rang_uzla++;												//увеличиваем ранг узла
		   }
	 }   //конец цикла перебора рёбер

	 //	 if (Rang_uzla==0) ier_global = 100;

return ier_global;
}

//——————————————————————————————————————————————————————————————————————————————
//Востановление уникальных параметров класса и расчёт коэффициентов СЛАУ для
//уравнений баланса тока в узлах
int Class_Uzel_Elektrik::Rash_vector_a_and_b(double *a_in, double *b_in)
{
	int ier;   	//номер ошибки (0 - без ошибок)
	int i;     	//счётчик
	int sign_U; //знак ребра: + если вход, - если выход.

	//--------------------------------------
	for (i = 0; i < Rang_uzla; i++)     //перебор по соседним рёбрам
		{
		(Uzel_Sosed_Rebro_pr_vh[i])? sign_U=1:sign_U=-1;   //знак ребра: + если вход, - если выход.

		//Получается уравнение вида Sum(+-I) = 0 для всех рёбер, примыкающих к узлу
		a_in[Uzel_Sosed_Rebro_num[i]] = (double)sign_U;

		(*b_in) = (double) 0.0;

		}     //конец перебор по соседним рёбрам
	//--------------------------------------

return ier;
}





