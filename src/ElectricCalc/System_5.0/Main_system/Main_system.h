#ifdef _WIN32
#include <tchar.h>
#include <vcl.h>
#pragma hdrstop
#include <cmath>
#include <stdio.h>
#include <iostream>

#include "stdafx.h"
#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include "linalg.h"

#include "..\Classes\Uzel\Class_Uzel_Elektrik.h"		//класс узлов
#include "..\Classes\Rebro\Class_Rebro_Elektrik.h"	   	//класс рёбер
#include "..\Classes\Graph\Kontur.h"                   	//класс графового анализа
#include <vcl.h>                                       	//визуальные компоненты - без них не работает
#include <windows.h>                                    //стандартная библиотека windows

//Функции:
//Чтения начальных данных о расчёте, параметров графа.
int NewReadHeader(FILE *f, double *HeaderData);

//Печать токов и напряжений на рёбрах графа после расчёта
int Print_current_data2(FILE *f1, FILE *f2, int Uzel_kol, int Rebro_kol, double t,
		Class_Uzel_Elektrik **Class_Uzel, Class_Rebro_Elektrik **Class_Rebro,
		double *vector_F);

//Печать заголовка (подписей)
int Print_current_header2(FILE *f1, FILE *f2, int Uzel_kol, int Rebro_kol,
		double t, Class_Uzel_Elektrik **Class_Uzel, Class_Rebro_Elektrik **Class_Rebro);

//печать конфигурации узлов (узлов и их соседей)
int Print_Uzel_config(FILE *f, Class_Uzel_Elektrik **Class_Uzel, int Uzel_kol);

//Функция решения СЛАУ, вход и выход стандартные массивы, преобразование
//данных для решения матрицы происходит внутри фунции
int Solve_lin_system(int Rebro_kol, double *vector_b, double **matrix_a,
		double *vector_F, bool pr_print, FILE *f);

//Ищет массив рёбер, составляющие все независимые замкнутые контура в данном графе
//(независимые с точки зрения уравнений Кирхгофа)
int Find_kontur_array(int Rebro_kol, int Uzel_kol, int *diod_kombo, int *kluch_kombo_mod,
		Class_Uzel_Elektrik **Class_Uzel,Class_Rebro_Elektrik **Class_Rebro,
		Kontur *Kontur_local, FILE *f, bool pr_print);

//По найденым замкнутым независимым контурам и узлам графа состовляет матрицу
//СЛАУ Кирхгофа. Размерность матрицы может меняться в ходе расчёта,
//исходя из работы диодов и положения ключей в цепи. В таком случае из неё
//выбрасываются строка и столбец с номером отключенного ребра.
int Make_lin_system(int Rebro_kol, int Uzel_kol, double *vector_b,
		double **matrix_a, double *vector_F, Class_Uzel_Elektrik **Class_Uzel,
		Class_Rebro_Elektrik **Class_Rebro,	Kontur *Kontur_Arr, int *diod_kombo,
		FILE *f, bool pr_print);

#endif

