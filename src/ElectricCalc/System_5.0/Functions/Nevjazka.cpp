#include <stdio.h>
#include <math.h>
#include <limits>

bool is_equal(double x, double y);
int Nevjazka_otnositelnaja_max_in_vektor(double *Xnew, double *Xold, int dlina_vektora_X, double *Nevjazka_out);
int Nevjazka_otnositelnaja(double Xnew, double Xold, double *Nevjazka_out);
bool is_equal(long double x,long double y);

//——————————————————————————————————————————————————————————————————————————————
// Невязка = Max( | ( Xnew(i) - Xold(i) ) / Xold(i) | )
int Nevjazka_otnositelnaja_max_in_vektor(double *Xnew, double *Xold, int dlina_vektora_X, double *Nevjazka_out)
{
int i;
int ier = 0;
double Nevjazka, Nevjazka_i;

Nevjazka = 0.0;
for (i=0; i < dlina_vektora_X; i++)
{
	if ( is_equal(Xold[i],0.0))
		{
		if ( is_equal(Xnew[i],0.0))
			{
				Nevjazka_i = 0.0;
				ier = 1;
				goto skip1;
			}
			else
			{
				Nevjazka_i = 999.9;
				ier = 2;
				goto skip1;
			}
		}
	Nevjazka_i = fabs( (Xnew[i] - Xold[i]) / Xold[i]);

skip1:
	if (Nevjazka_i > Nevjazka)  Nevjazka = Nevjazka_i;
}

*Nevjazka_out = Nevjazka;

return ier;
}

//——————————————————————————————————————————————————————————————————————————————
// Невязка =  | ( Xnew(i) - Xold(i) ) / Xold(i) |
int Nevjazka_otnositelnaja(double Xnew, double Xold, double *Nevjazka_out)
{
int ier = 0;
double Nevjazka;

if ( is_equal(Xold,0.0))
	{
	if ( is_equal(Xnew,0.0))
		{
		Nevjazka = 0.0;
		ier = 1;
		goto skip1;
		}
	else
		{
		Nevjazka = 999.9;
		ier = 2;
		goto skip1;
		}
	}
Nevjazka = fabs( (Xnew - Xold) / Xold);

skip1:
*Nevjazka_out = Nevjazka;
return ier;
}

//——————————————————————————————————————————————————————————————————————————————
//сравнение чисел типа double
bool is_equal(double x, double y)
{
	double eps = (std::numeric_limits<double>::epsilon())*100.0;
	return fabs(x-y) < eps;
}
//——————————————————————————————————————————————————————————————————————————————

//——————————————————————————————————————————————————————————————————————————————
//сравнение чисел типа double
bool is_equal(long double x,long double y)
{
	long double eps = (std::numeric_limits<long double>::epsilon())*100.0;
	return fabs(x-y) < eps;
}
