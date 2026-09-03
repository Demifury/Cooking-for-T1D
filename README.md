# Kuchnia dla T1D

**<https://demifury.github.io/Cooking-for-T1D/>**

Ściąga do gotowania przy cukrzycy typu 1. Indeks glikemiczny, węglowodany i cukry
dla ponad 300 produktów, przeliczone na 100 g lub 100 ml. Do tego sosy bez cukru,
sposoby na obniżenie IG potrawy i czytanie etykiet.

Kolor idzie za indeksem glikemicznym: zielony poniżej 50, pomarańczowy 50–69,
czerwony od 70. Próg jest ostrzejszy niż klasyfikacja medyczna, bo ma pomagać
przy wyborze w sklepie, a nie opisywać badanie.

## Na telefon

Otwórz adres i zainstaluj:

- **Android** — Chrome, menu z trzema kropkami, „Zainstaluj aplikację".
- **iPhone** — musi być Safari, przycisk udostępniania, „Do ekranu początkowego".

Dostajesz ikonę na ekranie głównym i pełny ekran bez paska adresu. Po pierwszym
otwarciu wszystko siedzi w pamięci telefonu, więc w sklepie bez zasięgu
i w kuchni z telefonem w trybie samolotowym działa tak samo.

## Skąd te liczby

Trzy źródła: międzynarodowe tabele indeksu glikemicznego Uniwersytetu w Sydney,
polskie *Tabele składu i wartości odżywczej żywności* (Kunachowicz i in., PZWL)
oraz USDA FoodData Central tam, gdzie polskich danych nie ma. Pełny opis jest
na dole strony, pod przyciskiem „Skąd te liczby".

Indeks glikemiczny tego samego produktu potrafi się różnić między badaniami
o kilkanaście punktów — zależy od odmiany, dojrzałości i sposobu obróbki.
Liczby tutaj to wartości typowe, nie pomiar.

## To nie jest porada medyczna

Ściąga pomaga wybierać w sklepie i przy garnku. Nie zastępuje rozmowy
z diabetologiem ani dietetykiem i nie służy do wyliczania dawek insuliny.

## Dla ciekawych, jak to zrobione

Czysty HTML, CSS i JavaScript w jednym pliku, zero bibliotek i zero zapytań
do sieci. Cała tabela to statyczny dokument, wyszukiwarka i sortowanie działają
na tym, co już jest w przeglądarce. Nic nie wychodzi na zewnątrz — w pamięci
przeglądarki zapisuje się jedna rzecz, wybrany tryb jasny albo ciemny.

| plik | do czego |
|---|---|
| `index.html` | cała ściąga: treść, style i skrypt |
| `manifest.webmanifest` | nazwa, ikona i tryb pełnoekranowy przy instalacji |
| `sw.js` | pamięć offline |
| `icon-*.png` | ikony na ekran główny |

Żeby uruchomić lokalnie, wystarczy otworzyć `index.html` w przeglądarce.
Instalacja i tryb offline wymagają adresu `https`, więc tego z dysku nie sprawdzisz.
