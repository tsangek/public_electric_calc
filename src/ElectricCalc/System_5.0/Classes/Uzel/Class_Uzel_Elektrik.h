#ifndef Class_Uzel_ElektrikH
#define Class_Uzel_ElektrikH

#define SOLVER_RANG 100       //размерность решателя (из скольки труб состоит система)

#include <stdio.h>
#include <math.h>

#include "E:\Data_all\User_Class7\block1.h"                    			//константы
#include "..\Rebro\Class_Rebro_Elektrik.h"								//класс рёбер

//---------------------------------------------------------------------------
class Class_Uzel_Elektrik //Решение системы уравнений методом Ньютона с численой производной
{
public:
//типы класса
typedef Class_Uzel_Elektrik **Uzel_Array;  		//тип - указатель на массив узлов
typedef Class_Rebro_Elektrik **Rebro_Array;  	//тип - указатель на массив рёбер

// переменные класса (глобальные для всех экземпляров, можно передавать во внешние функции)
int		Uzel_Sosed_Uzel_num[SOLVER_RANG];		//вектор номеров соседних узлов
int		Uzel_Sosed_Rebro_num[SOLVER_RANG];		//вектор номеров соседних рёбер
bool	Uzel_Sosed_Rebro_pr_vh[SOLVER_RANG];	//вектор параметров входа/выхода для данного узла относительно соседних рёбер

int Uzel_num;								//номер данного узла
int Rang_uzla;								//ранг узла (кол-во соседей)

int Active_Rebro_kol;                       //Кол-во активных рёбер - неотключённых
int Active_Uzel_kol;                        //Кол-во активных узлов - ранг которых больше 0 (на самом деле больше 1)

// уникальны для всех экземпляров
Uzel_Array Class_Uzel;                      //массив узлов
Rebro_Array Class_Rebro;                    //массив рёбер

// служебные
int ier_global;                            //номер ошибки

//---------------------------------------------------------------------------
// конструктор класса
Class_Uzel_Elektrik();

//---------------------------------------------------------------------------
//Псевдоконструктор - инициализация переменных класса. Анализ графа -
//переход от рёбер к узлам
int Ini(Class_Rebro_Elektrik **Class_Rebro_in,
		Class_Uzel_Elektrik **Class_Uzel_in, int Uzel_num_in, int Rebro_kol,
		int Active_Rebro_kol_in);

//---------------------------------------------------------------------------
//Востановление уникальных параметров класса и расчёт коэффициентов СЛАУ для
//уравнений баланса тока в узлах
int Rash_vector_a_and_b(double *a_in, double *b_in);

};
#endif
//---------------------------------------------------------------------------
