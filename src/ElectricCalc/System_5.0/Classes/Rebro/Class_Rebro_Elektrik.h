#ifndef Class_Rebro_ElektrikH
#define Class_Rebro_ElektrikH

#include <complex>
#include <stdio.h>
#include <math.h>
#include <vcl.h>

#include "E:\Data_all\User_Class7\block1.h"                    			//константы

//---------------------------------------------------------------------------
int name_Trakt(FILE *f, const char *x,int cur,long int *offset);          	//внешние программы - поиск названия в файле
int wrfisx_Trakt(FILE *f, const char *x,int n,long int offset,double *w); 	//внешние программы - чтение строки данных в файле
int clrstr(unsigned char *str);                                          	//внешние программы - удаление пробелов из строки
int obrstr(char *str,int n, double *w);                                   	//внешние программы - чтение строки данных в файле
int name_File(FILE *f, const char *x, char *w, long offset);               	//внешние программы - чтение символной строки в файле
bool is_equal(double x, double y);                                          //равенство чисел с плавающей точкой
//---------------------------------------------------------------------------
class Class_Rebro_Elektrik //Данные и логика рёбр графа в электрической цепи
{
public:
//типы класса
typedef int ( *ffpEquasionIU )();   //тип указателя на функцию без параметров

//указатели
ffpEquasionIU Ptr_FindAB_nonst;     //указатель на метод поиска коэф. A и B (U = A*I + B)
ffpEquasionIU Ptr_equasion_nonst;   //указатель на метод поиска сопутствующих величин, зная U и I

// переменные класса (глобальные для всех экземпляров, можно передавать во внешние функции)
static double EDS;         //ЭДС ребра
static double EDS_old;     //ЭДС ребра на предыдущем шаге
static double UR;          //Напряжение на активном сопротивлении
static double UL;          //Напряжение на индуктивности
static double UL_old;      //Напряжение на индуктивности на предыдущем шаге
static double UC;          //Напряжение на ёмкости
static double UC_old;      //Напряжение на ёмкости на предыдущем шаге
static double U;           //напряжение на ребре
static double U_old;       //Напряжение на ребре на предыдущем шаге

static double der_U;       //Производная напряжения без ЭДС на ребре: ((U-EDS) - (Uo-EDSo))/dt;

static double I;           //Ток на ребре
static double I_old;       //Ток на ребре на предыдущем шаге

static double R_rebra;     //Активное сопротивление ребра
static double C_rebra;     //Ёмкость ребра
static double L_rebra;     //Индуктивность ребра

static double dt;          //Временной шаг

static bool kolebanie;     //признак наличая колебаний в LC контуре ребра
static double omega;       //комплексная частота колебаний в LC контуре ребра
static double beta;        //декримент затухания в LC контуре ребра

static double A;           //Коэф. в линейном приближении зависимости напряжения
static double B;           //и тока при dt->0

static int pr_diod;        //состояние ключа ребра (0 - ребро не учитывается в расчётах)

// переменные класса (уникальные для каждого экземпляра)
double EDS_nonst;          //ЭДС ребра
double EDS_old_nonst;      //ЭДС ребра на предыдущем шаге
double UR_nonst;           //Напряжение на активном сопротивлении
double UL_nonst;           //Напряжение на индуктивности
double UL_old_nonst;       //Напряжение на индуктивности на предыдущем шаге
double UC_nonst;           //Напряжение на ёмкости
double UC_old_nonst;       //Напряжение на ёмкости на предыдущем шаге
double U_nonst;            //напряжение на ребре
double U_old_nonst;        //Напряжение на ребре на предыдущем шаге

double I_nonst;            //Ток на ребре
double I_old_nonst;        //Ток на ребре на предыдущем шаге

double dt_nonst;           //Временной шаг

int pr_rebra_nonst;        //Тип ребра ( наличие L, C и R элементов )

bool kolebanie_nonst;      //признак наличая колебаний в LC контуре ребра
double omega_nonst;        //комплексная частота колебаний в LC контуре ребра
double beta_nonst;         //декримент затухания в LC контуре ребра

int ier_rebra;             //номер ошибки при расчётах в конструкторе

double A_nonst;            //Коэф. в линейном приближении зависимости напряжения
double B_nonst;            //и тока при dt->0

// Инициализируются через конструктор (уникальны для всех экземпляров)
int j_rebra_nonst;           //номер данного ребра

int Uzel_vh_nonst;           //номер узла входа
int Uzel_vyh_nonst;          //номер узла выхода

double R_rebra_nonst;        //Активное сопротивление ребра
double C_rebra_nonst;        //Ёмкость ребра
double L_rebra_nonst;        //Индуктивность ребра
double EDS_rebra;

int pr_R;                    //признак наличия активного сопротивления
int pr_C;                    //признак наличия ёмкости
int pr_L;                    //признак наличия индуктивности
int pr_D;                    //признак наличия диода

int Uzel_vh_ini;           //номер узла входа
int Uzel_vyh_ini;          //номер узла выхода

double R_rebra_ini;        //Активное сопротивление ребра
double C_rebra_ini;        //Ёмкость ребра
double L_rebra_ini;        //Индуктивность ребра
double EDS_rebra_ini;

int pr_R_ini;                    //признак наличия активного сопротивления
int pr_C_ini;                    //признак наличия ёмкости
int pr_L_ini;                    //признак наличия индуктивности
int pr_D_ini;                    //признак наличия диода

int pr_diod_nonst;           //состояние ключа ребра (0 - ребро не учитывается в расчётах)

// служебные (глобальные для всех экземпляров, можно передавать во внешние функции)
static int ier_global;       //номер ошибки в методах класс

// конструктор класса:
Class_Rebro_Elektrik(FILE *f, int j_rebra_nonst_in);

//Востановление уникальных параметров класса и расчёт новых векторов давлений и расходов:

// Методы класса:
//------------------------------------------------------------------------------
//чтение данных ребра из файла в массив
int Rebro_Elektrik_ReadData_0(FILE *f, double *file_data, long int offset);

//------------------------------------------------------------------------------
//востановление уникальных значений класса в глобальные переменные и запуск
//расчёта коэф. A и B.
int Rash_new_AB();

//------------------------------------------------------------------------------
//Методы расчёта коэф. A и B для различных типов ребра
static int FindAB_R_1_0();
static int FindAB_C_10();
static int FindAB_CR_11();
static int FindAB_L_100();
static int FindAB_LR_101();
static int FindAB_LCR_111_110();

//------------------------------------------------------------------------------
//Методы поиска сопутствующих величин, зная U и I для различных типов ребра
static int equasion_R_1_0();
static int equasion_C_10();
static int equasion_CR_11();
static int equasion_L_100();
static int equasion_LR_101();
static int equasion_LCR_111_110();

//------------------------------------------------------------------------------
//Расчёт сопутствующих величин, зная U и I. Переход на новый шаг по времени.
int New_UI(double I_uzla, double dt_in);

//------------------------------------------------------------------------------
//Просто расчёт U, зная I. Не расчитывает сопутствующие величины,
//не переходит на следующий временной шаг
double Find_U_from_I(double I_uzla_in);
//------------------------------------------------------------------------------
};
#endif
//------------------------------------------------------------------------------
