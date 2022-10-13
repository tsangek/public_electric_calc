#include "Class_Rebro_Elektrik.h"

double 	Class_Rebro_Elektrik::EDS;       //ЭДС ребра
double 	Class_Rebro_Elektrik::EDS_old;   //ЭДС ребра на предыдущем шаге
double 	Class_Rebro_Elektrik::UR;        //Напряжение на активном сопротивлении
double 	Class_Rebro_Elektrik::UL;        //Напряжение на индуктивности
double 	Class_Rebro_Elektrik::UL_old;    //Напряжение на индуктивности на предыдущем шаге
double 	Class_Rebro_Elektrik::UC;        //Напряжение на ёмкости
double 	Class_Rebro_Elektrik::UC_old;    //Напряжение на ёмкости на предыдущем шаге
double 	Class_Rebro_Elektrik::U;         //напряжение на ребре
double 	Class_Rebro_Elektrik::U_old;     //Напряжение на ребре на предыдущем шаге

double 	Class_Rebro_Elektrik::der_U;     //Производная напряжения без ЭДС на ребре: ((U-EDS) - (Uo-EDSo))/dt;

double 	Class_Rebro_Elektrik::I;         //Ток на ребре
double 	Class_Rebro_Elektrik::I_old;     //Ток на ребре на предыдущем шаге

double 	Class_Rebro_Elektrik::R_rebra;   //Активное сопротивление ребра
double 	Class_Rebro_Elektrik::C_rebra;   //Ёмкость ребра
double 	Class_Rebro_Elektrik::L_rebra;   //Индуктивность ребра

double 	Class_Rebro_Elektrik::dt;        //Временной шаг

int		Class_Rebro_Elektrik::ier_global;//номер ошибки в методах класса

bool 	Class_Rebro_Elektrik::kolebanie; //признак наличая колебаний в LC контуре ребра
double 	Class_Rebro_Elektrik::omega;     //комплексная частота колебаний в LC контуре ребра
double 	Class_Rebro_Elektrik::beta;      //декримент затухания в LC контуре ребра

int		Class_Rebro_Elektrik::pr_diod;   //состояние ключа ребра (0 - ребро не учитывается в расчётах)

double 	Class_Rebro_Elektrik::A;         //Коэф. в линейном приближении зависимости напряжения
double 	Class_Rebro_Elektrik::B;         //и тока при dt->0

//______________________________________________________________________________________________
//Конструктор - получение уникальных данных узла и неизменных параметров класса.
//В данной программе каждон ребро = своему экземпляру класса.
Class_Rebro_Elektrik::Class_Rebro_Elektrik(FILE *f, int j_rebra_nonst_in)
{

int ier;                                //номер ошибки
int ier_rebra = 0;                     	//номер ошибки
int srt_length;                         //длина строки
long int offset;						//указатель на место начала чтения в файле
char z[64];                    			//название ребра - Rebro_A?
double file_data[20];                   //массив считываемых данных типа double
double d_n;                             //Вспомогательная переменная буффер типа double
int pr_zadanija_rebra;                  //признак того, какой функцией надосчитывать данное ребро

int	pr_R_nonst;                         //призак наличия активного сопротивления
int	pr_C_nonst;                         //призак наличия ёмкости
int	pr_L_nonst;                         //призак наличия индуктивности
//——————————————————————————————————————————————————————————————————————————————
//Передача переменых в класс
j_rebra_nonst = j_rebra_nonst_in;		//Номер данного ребра

//——————————————————————————————————————
offset=0L;								//установка указателя на начало файла

//——————————————————————————————————————
//считывание очередного названия из строки
srt_length=sprintf(z, "Rebro_A%d",j_rebra_nonst);		//формирование строки-названия данного ребра
if (srt_length > 10) ier_global = 300;          		//номер ошибки

//——————————————————————————————————————
//Устанавливаем указатель файла на начало  исх.данных для данной трубы
// по считанному названию
ier=name_Trakt(f,z,0,&offset);			//поиск данного ребра в файле по названию
if (ier!=0)  ier_global = 100;          //номер ошибки

//——————————————————————————————————————
//Выбор типа данных
ier=wrfisx_Trakt(f,"pr_rebra",1,offset, &d_n);	pr_zadanija_rebra = (int)d_n;  	//признак того, какой функцией надосчитывать данное ребро

if (pr_zadanija_rebra == 0) 							//Программа чтения 0
	{
	ier = Rebro_Elektrik_ReadData_0(f, file_data, offset); //вызов программы чтения
	if (ier!=0) ier_global = 200 + ier; 	//номер ошибки

	Uzel_vh_ini 	= Uzel_vh_nonst		= (int)	file_data[0];		// номер узла входа
	Uzel_vyh_ini	= Uzel_vyh_nonst	= (int)	file_data[1];		// номер узла выхода
	R_rebra_ini 	= R_rebra_nonst		= 		file_data[2];  		// Омическое сопротивление ребра графа
	C_rebra_ini 	= C_rebra_nonst		= 		file_data[3];  		// Ёмкость ребра графа
	L_rebra_ini 	= L_rebra_nonst		= 		file_data[4];  		// Индуктивность ребра графа
	pr_R_ini		= pr_R				= (int) file_data[5];  		// Признак наличия омического сопротивления ребра графа
	pr_C_ini		= pr_C				= (int) file_data[6];  		// Признак наличия ёмкости ребра графа
	pr_L_ini		= pr_L				= (int) file_data[7];  		// Признак наличия индуктивности ребра графа
	pr_D_ini		= pr_D				= (int) file_data[8];  		// Признак наличия диода на ребре графа
	EDS_rebra_ini	= EDS_rebra			= 		file_data[9];  		// ЭДС ребра графа
	}

//——————————————————————————————————————————————————————————————————————————————
pr_rebra_nonst = pr_R + pr_C*10 + pr_L*100;     //формирование типа ребра
//——————————————————————————————————————————————————————————————————————————————

beta_nonst = 0.0;          //инициализация нулями
omega_nonst = 0.0;         //инициализация нулями
kolebanie_nonst = false;   //инициализация false
pr_diod_nonst = 1;         //инициализация ребро включено

switch(pr_rebra_nonst)    //переключение по типу ребра
		{
		case 0:   //ничего нет - вообще это плохо, но иногда можно считать как активное сопротивление
				Ptr_FindAB_nonst = &FindAB_R_1_0;
				Ptr_equasion_nonst = &equasion_R_1_0;

				break;

		case 1:   //активное сопротивление
				Ptr_FindAB_nonst = &FindAB_R_1_0;
				Ptr_equasion_nonst = &equasion_R_1_0;
				break;

		case 10:  //ёмкость
				Ptr_FindAB_nonst = &FindAB_C_10;
				Ptr_equasion_nonst = &equasion_C_10;
				break;

		case 11:  //ёмкость и активное сопротивление
				Ptr_FindAB_nonst = &FindAB_CR_11;
				Ptr_equasion_nonst = &equasion_CR_11;
				break;

		case 100:  //индуктивность
				Ptr_FindAB_nonst = &FindAB_L_100;
				Ptr_equasion_nonst = &equasion_L_100;
				break;

		case 101:  //индуктивность и активное сопротивление
				Ptr_FindAB_nonst = &FindAB_LR_101;
				Ptr_equasion_nonst = &equasion_LR_101;
				break;

		case 110: //индуктивность и ёмкость
				Ptr_FindAB_nonst = &FindAB_LCR_111_110;
				Ptr_equasion_nonst = &equasion_LCR_111_110;

				kolebanie_nonst = true;   //колебательный контур
				//расчёт собственной частоты колебаний
				omega_nonst = pow(fabs(- 1.0/(L_rebra_nonst*C_rebra_nonst)),0.5);
				break;

		case 111:  //индуктивность, ёмкость и активное сопротивление
				Ptr_FindAB_nonst = &FindAB_LCR_111_110;
				Ptr_equasion_nonst = &equasion_LCR_111_110;

				beta_nonst = R_rebra_nonst/2.0/L_rebra_nonst; //дикримент затухания

				if( ( pow(R_rebra_nonst/(2.0*L_rebra_nonst),2.0) - 1.0/(L_rebra_nonst*C_rebra_nonst) ) < 0.0)
				{ kolebanie_nonst=true;  }   //колебательный контур
				else
				{ kolebanie_nonst=false; }   //нет колебаний - быстрое затухание

				//расчёт собственной частоты колебаний (величина имеет смысл не зависимо от наличия колебаний)
				omega_nonst = pow((double)fabs((double)pow(R_rebra_nonst/(2.0*L_rebra_nonst),2.0) - 1.0/(double)(L_rebra_nonst*C_rebra_nonst)),0.5);
				break;

		default:
				ier_rebra = pr_rebra_nonst;  //не нашёл нужного типа ребра - ошибка
		}

//——————————————————————————————————————————————————————————————————————————————
//инициализация параметров
		 EDS_nonst		= EDS_rebra;
		 UC_nonst		= 0.0;
		 U_nonst		= 0.0;
		 UL_nonst		= 0.0;
		 I_nonst 		= 0.0;
}

//——————————————————————————————————————————————————————————————————————————————
//Программа чтения
int Class_Rebro_Elektrik::Rebro_Elektrik_ReadData_0(FILE *f, double *file_data, long int offset)
{
int ier;		//номер ошибки

ier=wrfisx_Trakt(f,"Uzel_vh",	1,offset,&file_data[0]);	// номер узла входа
if (ier!=0) return 1;
ier=wrfisx_Trakt(f,"Uzel_vyh",	1,offset,&file_data[1]); 	// номер узла выхода
if (ier!=0) return 2;
ier=wrfisx_Trakt(f,"R_rebra",	1,offset,&file_data[2]);  	// Омическое сопротивление ребра графа
if (ier!=0) return 3;
ier=wrfisx_Trakt(f,"C_rebra",	1,offset,&file_data[3]);  	// Ёмкость ребра графа
if (ier!=0) return 4;
ier=wrfisx_Trakt(f,"L_rebra",	1,offset,&file_data[4]);  	// Индуктивность ребра графа
if (ier!=0) return 5;
ier=wrfisx_Trakt(f,"pr_R",		1,offset,&file_data[5]);  	// Признак наличия омического сопротивления ребра графа
if (ier!=0) return 6;
ier=wrfisx_Trakt(f,"pr_C",		1,offset,&file_data[6]);  	// Признак наличия ёмкости ребра графа
if (ier!=0) return 7;
ier=wrfisx_Trakt(f,"pr_L",		1,offset,&file_data[7]);  	// Признак наличия индуктивности ребра графа
if (ier!=0) return 8;
ier=wrfisx_Trakt(f,"pr_D",		1,offset,&file_data[8]);  	// Признак наличия диода на ребре графа
if (ier!=0) return 9;
ier=wrfisx_Trakt(f,"EDS_rebra",	1,offset,&file_data[9]);  	// ЭДС ребра графа
if (ier!=0) return 10;

return 0;		//без ошибок
}

//——————————————————————————————————————————————————————————————————————————————
//Восиановление уникальных значений экземпляра класса, поиск коэффициентов A и B
int Class_Rebro_Elektrik::Rash_new_AB()
{
int i, ier;

//-----------------------------------------
//востановление уникальных параметров класса
dt = dt_nonst;

EDS 	= EDS_nonst;
EDS_old = EDS_old_nonst;

UC_old	= UC_old_nonst;
I_old 	= I_old_nonst;
U_old = U_old_nonst;

R_rebra	= R_rebra_nonst;
C_rebra	= C_rebra_nonst;
L_rebra	= L_rebra_nonst;

beta		= beta_nonst;
omega		= omega_nonst;
kolebanie	= kolebanie_nonst;

pr_diod = pr_diod_nonst;

//-----------------------------------------
//поиск коэфициентов A и B (U = A*I + B)
ier = Ptr_FindAB_nonst();

//-----------------------------------------
//сохранение коэфициентов A и B в уникальные нестатические переменные класса
A_nonst = A;
B_nonst = B;

return ier;
}



//——————————————————————————————————————————————————————————————————————————————
//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением
int Class_Rebro_Elektrik::FindAB_R_1_0()
{
	B = EDS;
	A = R_rebra;

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//поиск коэфициентов A и B (U = A*I + B) для случая с ёмкостью
int Class_Rebro_Elektrik::FindAB_C_10()
{
	B = U_old + EDS - EDS_old;
	A = dt/C_rebra;

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением и ёмкостью
int Class_Rebro_Elektrik::FindAB_CR_11()
{
	int ier;
	bool bad_data = false;
	ffpEquasionIU Ptr_Local;

	if (dt/C_rebra/R_rebra > 100.0) {Ptr_Local = &FindAB_C_10; bad_data = true;}
	if (dt/C_rebra/R_rebra < 1.0e-12) {Ptr_Local = &FindAB_R_1_0; bad_data = true;}

	if (bad_data)
	{
	ier = Ptr_Local();
	Ptr_Local = NULL;
	return ier;
	}

	B = -I_old/C_rebra*dt/( exp(dt/C_rebra/R_rebra) - (double) 1.0) +  U_old + EDS - EDS_old;
	A = dt/C_rebra/((double) 1.0 - exp(-dt/C_rebra/R_rebra));

	Ptr_Local = NULL;
return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//поиск коэфициентов A и B (U = A*I + B) для случая с индуктивностью
int Class_Rebro_Elektrik::FindAB_L_100()
{
	B = -I_old*L_rebra/dt + EDS;
	A = L_rebra/dt;

	return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением и индуктивностью
int Class_Rebro_Elektrik::FindAB_LR_101()
{
	int ier;
	bool bad_data = false;
	ffpEquasionIU Ptr_Local;

	if (dt*R_rebra/L_rebra > 100.0) {Ptr_Local = &FindAB_R_1_0; bad_data = true;}
	if (dt*R_rebra/L_rebra < 1.0e-9) {Ptr_Local = &FindAB_L_100; bad_data = true;}

	if (bad_data)
	{
	ier = Ptr_Local();
	Ptr_Local = NULL;
	return ier;
	}

	B = -dt*(I_old*R_rebra*exp(-dt*R_rebra/L_rebra) - (U_old - EDS_old)*(exp(-dt*R_rebra/L_rebra) - (double)1.0))/(L_rebra/R_rebra*(exp(-dt*R_rebra/L_rebra) - (double)1.0) + dt) + U_old + EDS - EDS_old;
	A = R_rebra*dt/(L_rebra/R_rebra*(exp(-dt*R_rebra/L_rebra) - (double)1.0) + dt);

//	B = -I_old*R_rebra/( exp(dt*R_rebra/L_rebra) - (double)1.0) + EDS;
//	A = R_rebra/((double)1.0 - exp(-dt*R_rebra/L_rebra));

Ptr_Local = NULL;
return 0;
}


//——————————————————————————————————————————————————————————————————————————————
//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением,
//ёмкостью и индуктивностью (решение уравнения колебаний в комплексных числах)
int Class_Rebro_Elektrik::FindAB_LCR_111_110()
{
	std::complex <double> A1_local;
	std::complex <double> B1_local;
	std::complex <double> A_local;
	std::complex <double> B_local;
	std::complex <double> del1,del2,del3,del4,del5,del6,del7;

	std::complex <double> beta_complex;
	std::complex <double> omega_complex;

	double A_local_real;
	double B_local_real;
	double A_local_imag;
	double B_local_imag;

	beta_complex.real(beta);
	beta_complex.imag(0.0);

	if (kolebanie)
	{
	omega_complex.real(0.0);
	omega_complex.imag(omega);
	}
	else
	{
	omega_complex.real(omega);
	omega_complex.imag(0.0);
	}

	B_local =  ((UC_old - U_old + EDS_old + L_rebra*I_old*(beta_complex - omega_complex))*exp(-dt*(beta_complex - omega_complex)) - (UC_old - U_old + EDS_old + L_rebra*I_old*(beta_complex + omega_complex))*exp(-dt*(beta_complex + omega_complex)))/(L_rebra*C_rebra/dt)/((double)2.0*omega_complex + (beta_complex - omega_complex)*exp(-dt*(beta_complex + omega_complex)) - (beta_complex + omega_complex)*exp(-dt*(beta_complex - omega_complex))) + EDS + U_old - EDS_old;
	A_local = (dt/C_rebra)*((double)2.0*omega_complex)/((double)2.0*omega_complex + (beta_complex - omega_complex)*exp(-dt*(beta_complex + omega_complex)) - (beta_complex + omega_complex)*exp(-dt*(beta_complex - omega_complex)));


//	B_local =  -(UC_old - U_old + EDS_old - L_rebra*I_old/dt)*((double)1.0-(double)2.0*beta*dt) + EDS + U_old - EDS_old;
//	A_local = (L_rebra/dt);


	A_local_real = A_local.real();
	B_local_real = B_local.real();
	A_local_imag = A_local.imag();
	B_local_imag = B_local.imag();

	A = A_local_real;
	B = B_local_real;

	if (!is_equal(A_local_imag, 0.0) || !is_equal(B_local_imag, 0.0)) return 1;

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//Определение U по найденному I, расчёт сопутсвующих величин - заряд конденсатора,
//напряжения на активном сопротивлении, ёмкости и индуктивности, производная
//разности напряжения и ЭДС (derU).
//Переход к следующему временному слою - присваивание переменным предыдущего шага
//значений этого шага.
//——————————————————————————————————————————————————————————————————————————————
int Class_Rebro_Elektrik::New_UI(double I_uzla, double dt_in)
{
	int ier;

	I = I_uzla;                            //присваивание нового I
	U_nonst = A_nonst*I_uzla + B_nonst;    //нахождение U

	//-------------------------------
	//востановдение уникальных значений класса
	dt = dt_nonst = dt_in;
	U 		= U_nonst;
	U_old	= U_old_nonst;
	EDS 	= EDS_nonst;
	EDS_old	= EDS_old_nonst;
	UR 		= UR_nonst;
	UL		= UL_nonst;
	UC 		= UC_nonst;
	UC_old	= UC_old_nonst;
	I_old 	= I_old_nonst;
	R_rebra	= R_rebra_nonst;
	C_rebra	= C_rebra_nonst;
	L_rebra	= L_rebra_nonst;

	beta		= beta_nonst;
	omega		= omega_nonst;
	kolebanie	= kolebanie_nonst;
	pr_diod 	= pr_diod_nonst;

	//-------------------------------
	der_U = (U  - EDS  - ( U_old - EDS_old))/dt;  //расчёт производной напряжения

	ier = Ptr_equasion_nonst();   //переход к функции расчёта сопутсвующих параметров

	//-------------------------------
	//переход к следующему временному шагу - присваивание переменным предыдущего
	//шага значений этого шага. Сохранение уникальных параметров в нестатических
	//переменных
	EDS_old_nonst = EDS;
	UC_old_nonst = UC;
	I_old_nonst = I_nonst = I;
	U_old_nonst = U_nonst = U;

	UL_nonst = UL;
	UR_nonst = UR;
	UC_nonst = UC;

	//-------------------------------
	return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//расчёт сопутсвующих параметров для случая с активным сопротивлением
int Class_Rebro_Elektrik::equasion_R_1_0()
{

	UC = 0.0;
	UL = 0.0;
	UR = (U - EDS);

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//расчёт сопутсвующих параметров для случая с ёмкостью
int Class_Rebro_Elektrik::equasion_C_10()
{
	UC = (U - EDS);
	UL = 0.0;
	UR = 0.0;

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//расчёт сопутсвующих параметров для случая с активным сопротивлением и ёмкостью
int Class_Rebro_Elektrik::equasion_CR_11()
{
	UC = (U - EDS) - R_rebra*I;
	UL = 0.0;
	UR = R_rebra*I;

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//расчёт сопутсвующих параметров для случая с аиндуктивностью
int Class_Rebro_Elektrik::equasion_L_100()
{
	UC = 0.0;
	UL = (U - EDS);
	UR = 0.0;

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//расчёт сопутсвующих параметров для случая с активным сопротивлением и индуктивностью
int Class_Rebro_Elektrik::equasion_LR_101()
{
	UC = 0.0;
	UL = (U - EDS) - R_rebra*I;
	UR = R_rebra*I;

return 0;
}


//——————————————————————————————————————————————————————————————————————————————
//расчёт сопутсвующих параметров для случая с активным сопротивлением, ёмкостью и индуктивностью
int Class_Rebro_Elektrik::equasion_LCR_111_110()
{
	std::complex <double> A1;
	std::complex <double> A2;
	std::complex <double> A1I;
	std::complex <double> A2I;

	std::complex <double> I_ans;
	std::complex <double> dI_ans;
	std::complex <double> q_ans;

	std::complex <double> beta_complex;
	std::complex <double> omega_complex;

	double I_ans_real;
	double I_ans_imag;
	double q_ans_real;
	double q_ans_imag;

	beta_complex.real(beta);
	beta_complex.imag(0.0);

	if (kolebanie)
	{
	omega_complex.real(0.0);
	omega_complex.imag(omega);
	}
	else
	{
	omega_complex.real(omega);
	omega_complex.imag(0.0);
	}


	A1 = -( (UC_old - U_old) / L_rebra + I_old * (beta_complex + omega_complex) + C_rebra * der_U * (beta_complex - omega_complex)) / ((double)2.0 * omega_complex * (beta_complex + omega_complex));
	A2 = +( (UC_old - U_old) / L_rebra + I_old * (beta_complex - omega_complex) + C_rebra * der_U * (beta_complex + omega_complex)) / ((double)2.0 * omega_complex * (beta_complex - omega_complex));

	A1I = +( (UC_old - U_old) / L_rebra + I_old * (beta_complex + omega_complex) + C_rebra * der_U * (beta_complex - omega_complex)) / ((double)2.0 * omega_complex);
	A2I = -( (UC_old - U_old) / L_rebra + I_old * (beta_complex - omega_complex) + C_rebra * der_U * (beta_complex + omega_complex)) / ((double)2.0 * omega_complex);

	q_ans =  C_rebra * (U_old - C_rebra*R_rebra*der_U) + C_rebra*der_U*dt + A1*exp(-dt*(beta_complex + omega_complex)) + A2*exp(-dt*(beta_complex - omega_complex));
	q_ans_real = q_ans.real();
	q_ans_imag = q_ans.imag();

	dI_ans = -A1I*(beta_complex + omega_complex) * exp(-dt*(beta_complex + omega_complex)) - A2I*(beta_complex - omega_complex) * exp(-dt*(beta_complex - omega_complex));

	UC = q_ans_real/C_rebra;
	UL = dI_ans.real()*L_rebra;
	UR = R_rebra*I;

	if (!is_equal(I_ans_imag, 0.0) || !is_equal(q_ans_imag, 0.0)) return 1;

return 0;
}

//——————————————————————————————————————————————————————————————————————————————
//Определение U по найденному I
double Class_Rebro_Elektrik::Find_U_from_I(double I_uzla_in)
{
	double U_out = A_nonst*I_uzla_in + B_nonst;

return U_out;
}






