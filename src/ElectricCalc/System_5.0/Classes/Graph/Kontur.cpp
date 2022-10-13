#include "Kontur.h"

//——————————————————————————————————————————————————————————————————————————————
//конструктор
Kontur::Kontur()
{
}  //конец конструктора

//——————————————————————————————————————————————————————————————————————————————
//псевдодеструктор - принудительное удаление всех созданных при инициализации
//массивов, возможно, для их повторного создания
void Kontur::delete_Kontur_data()
{
int i,j;
	 for (i = 0; i < Kontur_rang_max; i++)
	 {
		 for (j = 0; j < Uzel_kol; j++)
			{
			delete Kontury[i][j];
			}
	 }
	 for (i = 0; i < Kontur_rang_max; i++)
	 {
		delete Kontury[i];
	 }

	 delete pr_nezavis;
	 delete Rangy;
	 delete Kontury;
	 delete Uzel_propusk;
	 delete Uzel_svjaz;
}  //конец псевдодеструктора

//——————————————————————————————————————————————————————————————————————————————
//инициализация переменных - псевдоконструктор
void Kontur::Ini(
Class_Uzel_Elektrik **Class_Uzel_in,  	//массивов классов узлов
Class_Rebro_Elektrik **Class_Rebro_in,	//массивов классов рёбер
int Uzel_kol_in,                        //кол-во узлов
int Rebro_kol_in,                       //кол-во рёбер
int Kluch_kol)                          //кол-во разомкнутых ключей (отключенных рёбер)
{
int i,j;           //счётчики
int ier;           //номер ошибки

	 //принудительное удаление всех старых массивов перед созданием новых
	 delete_Kontur_data();

	 Class_Uzel = Class_Uzel_in;  	//массивов классов узлов
	 Class_Rebro = Class_Rebro_in; 	//массивов классов рёбер
	 Uzel_kol = Uzel_kol_in;        //кол-во узлов
	 Rebro_kol = Rebro_kol_in;      //кол-во рёбер

	 //создание массива узлов начала в несвязаных цепях
	 //т.е. по одному узлу из каждой такой цепи, который бы входил в независимый
	 //замкнутый контур
	 Uzel_propusk 	= new int[Uzel_kol];
	 //создание массива узлов, где сказанно к какой несвязаной цепи они принадлежат
	 Uzel_svjaz 	= new int[Uzel_kol];

	 ier = Svjaznost(&kontur_count); //вызов функции поиска связанных цепей

	 //максимальное количество независимых замкнутых контуров по теории графов
	 Kontur_rang_max = Rebro_kol - Kluch_kol - Uzel_kol + kontur_count;

	 pr_nezavis = new int  [Rebro_kol];			//массив, показывающий были ли контуры с данным ребром (0 - небыло, 1 - были)
	 Rangy      = new int  [Kontur_rang_max];   //сколько рёбер в независимом замкнутом контуре
	 Kontury 	= new int **[Kontur_rang_max];  //массив независимых замкнутых контуров
	 for (i = 0; i < Kontur_rang_max; i++)
	 {
		Kontury[i] = new int*[Uzel_kol];
			 for (j = 0; j < Uzel_kol; j++)
			{
			Kontury[i][j] = new int[2];
			}
	 }

	 Kontur_rang_current = 0; //инициализация количества найденных контуров нулём
}  //конец инициализации

//_________________________________________________________________________________
//Рекурсивный метод поиска пути. Вызывает сам себя для узлов-соседей где ещё не был.
//Умирает, если в узле уже был и вызывает запись всего пути (write_to_Kontury),
//если пришёл в узел начала.
int Kontur::Find_Kontur(
int Uzel_num,    		//номер данного узла
int *pr_Uzel_in,        //В каких узлах был данный метод вплоть до этого (в списке 0 - не был, 1 - был, 2 - начало)
int *Kontur_path_in,    //По каким рёбрам шёл данный метод до этого узла
int Kontur_rang_in,     //сколько рёбер данный метод уже прошёл
bool *Kontur_znak_in)   //напрвление обхода пройденых рёбер
{

	int ier;   		//номер ошибки (0 - без ошибок)
	int i;     		//счётчик
	int Sosed_num;  //номер узла соседа
	int Rang_uzla;  //ранг узла - сколько у узла соседей

	Rang_uzla = Class_Uzel[Uzel_num]->Rang_uzla; //ранг узла берётся из массива классов узлов

	//------------------------------------------
	//создаются новые массивы для передачи дальше в рекурсию, чтобы у всех путей
	//из данного узла были общие предки, но разные потомки
	//------------------------------------------
	//В каких узлах был данный метод вплоть до этого (в списке 0 - не был, 1 - был, 2 - начало)
	int *pr_Uzel = new int[Uzel_kol];
	for (i = 0; i < Uzel_kol; i++)     //копирование из предка в потомка
	{
	pr_Uzel[i] = pr_Uzel_in[i];
	}

	if(pr_Uzel[Uzel_num]!=2) pr_Uzel[Uzel_num] = 1;  //отмечаем, что были в данном узле

	//------------------------------------------
	int *Kontur_path = new int[Kontur_rang_in+1];     //По каким рёбрам шёл данный метод до этого узла
	bool *Kontur_znak = new bool[Kontur_rang_in+1];   //напрвление обхода пройденых рёбер
	int Kontur_rang = Kontur_rang_in+1;               //увеличиваем длину пути на 1

	for (i = 0; i < Kontur_rang_in; i++)              //копирование из предка в потомка
	{
	Kontur_path[i] = Kontur_path_in[i];
	Kontur_znak[i] = Kontur_znak_in[i];
	}

	//------------------------------------------
	//Поиск доступных соседей - тех где метод ещё не был
	for (i = 0; i < Rang_uzla; i++)     //перебор по соседним узлам
		{
		//проверяем по какому ребру мы идём к соседу - если по тому, по которуму
		//пришли, то пропускаем, чтобы выйдя из начальной точки сразу не вернуться
		//назад
		if (Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_num[i]==Kontur_path[Kontur_rang_in-1]) continue;

		//номер соседа берём из массива классов узлов
		Sosed_num = Class_Uzel[Uzel_num]->Uzel_Sosed_Uzel_num[i];

		if(pr_Uzel[Sosed_num]==1) continue;   //уже там были - пропускаем
		if(pr_Uzel[Sosed_num]==2)  //это узел откуда начали - переходим к записи
		{
		//записываем последний участок пути в массивы
		Kontur_path[Kontur_rang_in] = Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_num[i];
		Kontur_znak[Kontur_rang_in] = Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_pr_vh[i];
		//вызываем функцию записи пути в файл
		write_to_Kontury(Kontur_path, Kontur_rang, Kontur_znak);

		continue;  //следующий сосед
		}

		//В узле-соседе где метод не был - записываем последние рёбра и направления
		Kontur_path[Kontur_rang_in] = Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_num[i];
		Kontur_znak[Kontur_rang_in] = Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_pr_vh[i];
		//Вызываем эту же функцию для соседа
		ier = Find_Kontur(Sosed_num, pr_Uzel, Kontur_path, Kontur_rang, Kontur_znak);

		}     //конец перебор по соседним узлам

	//------------------------------------------
	//удаление потомков
	delete pr_Uzel;
	delete Kontur_path;
	delete Kontur_znak;
	return ier;
}   //конец рекурсивного метода поиска пути

//_________________________________________________________________________________
//запись всего пройденного пути (замкнутого контура), пройденного с помощью
//Find_Kontur, если он независимый, т.е. в него входит хотя бы одно ребро,
//которого не было в других контурах
void Kontur::write_to_Kontury(
int *Kontur_path,   //По каким рёбрам шёл данный метод
int Kontur_rang,    //сколько рёбер данный метод прошёл
bool *Kontur_znak)  //напрвление обхода пройденых рёбер
{
if (enough) return;  //выход если достигнуто максимально возможное кол-во независ. замкнутых контуров

	bool povtor = true;   //параметр зависимости контуров (точнее - наличия повторений рёбер)
	int i,j,k;       //счётчики

	//------------------------------------------
	//проверка повторений
	for( i = 0; i < Kontur_rang; i++)
	{
		//если есть в контуре новое ребро, то заходим и контура независимы
		if(pr_nezavis[Kontur_path[i]] == 1) continue;
		povtor = false;
	}

//------------------------------------------
if (povtor) return;  //если зависимы то убиваем функцию ничего не делая

	//------------------------------------------
	//помечаем все пройденные рёбра в этом контуре для определения независимости
	//дальнейших найденных контуров
	for( i = 0; i < Kontur_rang; i++)
	{
		if(pr_nezavis[Kontur_path[i]] == 1) continue;
		pr_nezavis[Kontur_path[i]] = 1;
	}

	//------------------------------------------
	//записываем найденные контура в основной массив Kontury[i][j][k]
	//i,j - номер контура и номер рёбра в контуре по порядку обхода
	//k = 0 - номер ребра в графе
	//k = 1 - направление обхода ребра
	for( i = 0; i < Kontur_rang; i++)
	{
		Kontury[Kontur_rang_current][i][0] = Kontur_path[i];
		Kontury[Kontur_rang_current][i][1] = (int)Kontur_znak[i];
	}
	Rangy[Kontur_rang_current] = Kontur_rang;  //количество рёбер в данном контурк

	Kontur_rang_current++; //инкримент кол-ва найденных контуров

	//устанавливаем флаг, если достигнуто максимальное возможное кол-во контуров
	if (Kontur_rang_current == Kontur_rang_max) enough = true;
}   //конец функции записи

//_________________________________________________________________________________
//Первый вызов рекурсии Find_Kontur - кроме входных параметров, размерности потомков
//и записи результатов соответствует Find_Kontur
int Kontur::Start_from(
int Uzel_num) //номер первого узла
{
	int i,ier;
	int Rang_uzla;
	int Sosed_num;

	Rang_uzla = Class_Uzel[Uzel_num]->Rang_uzla;

	int *pr_Uzel = new int[Uzel_kol];
	for (i = 0; i < Uzel_kol; i++)
	{
	pr_Uzel[i] = 0;
	if (i==Uzel_num) pr_Uzel[i] = 2;
	}

	int *Kontur_path = new int[1];
	bool *Kontur_znak = new bool[1];
	int Kontur_rang = 1;

		//______________________________________________
	for (i = 0; i < Rang_uzla; i++)     //перебор по соседним рёбрам
		{
		Sosed_num = Class_Uzel[Uzel_num]->Uzel_Sosed_Uzel_num[i];

		if(pr_Uzel[Sosed_num]==1) continue;

		Kontur_path[Kontur_rang-1] = Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_num[i];
		Kontur_znak[Kontur_rang-1] = Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_pr_vh[i];
		ier = Find_Kontur(Sosed_num, pr_Uzel, Kontur_path, Kontur_rang, Kontur_znak);

		}     //конец перебор по соседним рёбрам


	delete pr_Uzel;
	delete Kontur_path;
	delete Kontur_znak;
	return 0;
}   //конец Start_from

//_________________________________________________________________________________
//запуск поиска замкнутых независимых контуров - инициализирует переменные и
//массивы, вызывает Start_from.
int Kontur::Start_all()
{
	int i,j;     		//счётчики
	enough = false;     //инициализация достаточности кол-ва найденных контуров (недостаточно)

	//-----------------------------------------
	//инициализация признака независимости контуров - встречались ли рёбра
	//(пока - все не встречались)
	for (j = 0; j < Rebro_kol; j++)
	 {
		pr_nezavis[j] = 0;
	 }

	//-----------------------------------------
	Rangy[0] = 0; //нет контуров, ранг нулевого инициализируется условно 0

	//-----------------------------------------
	//инициализация массивов рангов и контуров нулями
	for (i = 0; i < Kontur_rang_max; i++)
	 {
		 Rangy[i] = 0;
		 for (j = 0; j < Uzel_kol; j++)
			{
			Kontury[i][j][0] = 0;
			Kontury[i][j][1] = 0;
			}
	 }

	//-----------------------------------------
	//если по теории графов нет независимых замкнутых контуров - тогда выход
	if (Kontur_rang_max==0) return 0;

	//-----------------------------------------
	//поиск контуров из всех возможных узлов, пока не найдем максимально
	//возможное число независимых замкнутых контуров
	for (i = 0; (i < Uzel_kol) && (!enough) ; i++)
	{
	Start_from(i); //запуск из узла i
	}

	return 0;
}   //конец функции запуска

//_________________________________________________________________________________
//печать независимых замкнутых контуров
void Kontur::fprint_kontur(
FILE *f)  //файл для записи
{
 int i,j;
 for (i = 0; i < Kontur_rang_max; i++) {
	 for (j = 0; j < Rangy[i]; j++) {
		fprintf(f,"%d\t",Kontury[i][j][0]);
	 }
	 fprintf(f,"\n");
 }
}  //конец печати независимых замкнутых контуров

//_________________________________________________________________________________
//печать знаков рёбер при обходе независимых замкнутых контуров
void Kontur::fprint_znak(
FILE *f) //файл для записи
{
 int i,j;
  for (i = 0; i < Kontur_rang_max; i++) {
	 for (j = 0; j < Rangy[i]; j++) {
		fprintf(f,"%d\t",Kontury[i][j][1]);
	 }
	 fprintf(f,"\n");
 }
}  //конец печати знаков рёбер при обходе независимых замкнутых контуров

//_________________________________________________________________________________
//Определяет из скольки несвязаных цепей состоит граф при помощи Find_svjaz
int Kontur::Svjaznost(
int *kontur_count_out) //сколько получилось несвязанных цепей
{
	int i,j;   //счётчики
	int ier;   //номер ошибки

	int *pr_Uzel = new int[Uzel_kol];   //массив флагов посещения узлов

	//-----------------------------------------
	//инициализация используемых массивов
	for (i = 0; i < Uzel_kol; i++)
	{
		pr_Uzel[i] = 0;           //массив флагов посещения узлов
		Uzel_svjaz[i] = -1;       //массив номера несвязанной цепи
		Uzel_propusk[i] = 0;      //массив узлов начал для несвязанных цепей
	}

	//-----------------------------------------
	int kontur_count = 0;    //инициализация счётчика кол-ва несвязанных цепей нулём

	//-----------------------------------------
	//поиск несвязанных цепей
	for (i = 0; i < Uzel_kol; i++)    //перебор узлов
	{
		if(pr_Uzel[i] != 0) continue; //этот узел уже входит в другую цепь - пропуск

		//поиск всех узлов до которых можно дойти из данного
		ier = Find_svjaz(i, pr_Uzel, -1);

		//переписываем все найденые узлы с общим номером цепи
		for (j = 0; j < Uzel_kol; j++)
		{
			//если узел принадлежит последней найденной цепи - заходим (а именно
			//Uzel_svjaz[j]==-1 - у него ещё нет номера цепи, т.е. другой цепи он
			// не принадлежит и pr_Uzel[j] != 0 - в нем мы уже успели побывать)
			if (Uzel_svjaz[j]==-1 && pr_Uzel[j] != 0)
			{
			Uzel_svjaz[j] = kontur_count;   //во все узлы записываем номер их цепи
			}
		}
		kontur_count++; 	//инкримент количества несвязанных цепей
	}

//-----------------------------------------
delete pr_Uzel;   //удаление созданных массивов
*kontur_count_out = kontur_count;  //количество несвязанных цепей - на выход
return ier;
}   //конец Svjaznost

//_________________________________________________________________________________
//Рекурсивно ищет узлы в которые можно попасть из начального по принципу Find_Kontur
int Kontur::Find_svjaz(
int Uzel_num, 	//номер данного узла
int *pr_Uzel,   //массив флагов посещения узлов
int Rebro_vhoda)//номер ребра, по которому аошли в данный узел
{

	int ier=0;   	//номер ошибки (0 - без ошибок)
	int i;     		//счётчик
	int Sosed_num;  //номер соседа
	int Rang_uzla;  //ранг узла - кол-во соседей

	//ранг узла получаем из массива классов узлов
	Rang_uzla = Class_Uzel[Uzel_num]->Rang_uzla;

	pr_Uzel[Uzel_num] = 1;  //отмечаем, что посетили данный узел

	//---------------------------------------------
	for (i = 0; i < Rang_uzla; i++)     //перебор по соседним рёбрам
		{
		//не даём методу идти назад по тому же ребру
		//(может здесь это и не обязательно)
		if (Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_num[i] == Rebro_vhoda ) continue;

		//номер соседа берётся из массива классов узлов
		Sosed_num = Class_Uzel[Uzel_num]->Uzel_Sosed_Uzel_num[i];

		if(pr_Uzel[Sosed_num]==1) continue; //если в узле-соседе уже были - пропуск

		//вызов этой же функции для узла соседа - рекурсия
		ier = Find_svjaz(Sosed_num, pr_Uzel, Class_Uzel[Uzel_num]->Uzel_Sosed_Rebro_num[i]);
		}     //конец перебор по соседним рёбрам
	//---------------------------------------------

return ier;
}  //конец Find_svjaz

//_________________________________________________________________________________
//Записывает рёбра не вошедшие ни в один независимый замкнутый контур -
//"оборванные" рёбра
int Kontur::Find_cut_wires(int *pr_cut_wires)
{
	int i,j;  //счётчики

	//инициализация признака - сначала все рёбра не входят в контура
	for (i = 0; i < Rebro_kol; i++)
	{
		pr_cut_wires[i] = 0;
	}

	//поиск рёбер в контурах
	for (i = 0; i < Kontur_rang_max; i++)  //по всем контурам
	{
		for (j = 0; j < Rangy[i]; j++)     //по всем рёбрам в контуре
		{
			//Если такое ребро из контура ещё не встречалось - отметить его.
			//Рёбра, которых нет в контурах останутся неотмеченными.
			if(pr_cut_wires[Kontury[i][j][0]] == 0) pr_cut_wires[Kontury[i][j][0]] = 1;
		}
	}

return 0;
} //конец Find_cut_wires

//_________________________________________________________________________________
//В каждой несвязаной цепи выбирает узел начала, принадлежащий замкнутому
//контуру, и записывает его
int Kontur::Find_Uzel_svjaz()
{
	int i,j,k;  //счётчики

	for (k = 0; k < kontur_count; k++)   //для каждой несвязанной цепи
	{
		for (i = 0; i < Kontur_rang_max; i++)   //для всех контуров
		{
			for (j = 0; j < Rangy[i]; j++)     //и рёбер в контурах
			{
				//если узел входа или выхода данного ребра из контура принадлежит
				//узлам данной (k-ой) несвязной цепи - то выбираем его и
				//записываем, также перескакиваем к следующей цепи. Если нет, то
				//перебираем все рёбра во всех контурах, пока не найдём
				if(Uzel_svjaz[Class_Rebro[Kontury[i][j][0]]->Uzel_vh_nonst] == k )
				{
					Uzel_propusk[Class_Rebro[Kontury[i][j][0]]->Uzel_vh_nonst] = 1;
					goto skip2;
				}
				if(Uzel_svjaz[Class_Rebro[Kontury[i][j][0]]->Uzel_vyh_nonst] == k )
				{
					Uzel_propusk[Class_Rebro[Kontury[i][j][0]]->Uzel_vyh_nonst] = 1;
					goto skip2;
				}
			}
		}
	skip2:   //точка прескока
	k=k;     //без этой строчки не работает точка перескока
	}

return 0;
}   //конец Find_Uzel_svjaz

