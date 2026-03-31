# DB DETAILS

## 1. categories

Questa tabella serve a raggruppare i prodotti in insiemi logici.

### Colonne

**id**:\
Chiave primaria della categoria.
Serve per identificare in modo univoco ogni categoria nel database.

**name**:\
Nome leggibile della categoria.
Esempio: “Cibo liofilizzato”, “Razioni caloriche”.

**slug**:\
Versione del nome adatta agli URL.
Esempio: cibo-liofilizzato.
Serve per creare link puliti e leggibili.

**description**:\
Descrizione facoltativa della categoria.
Può essere usata nella pagina categoria o per spiegare il tipo di prodotti contenuti.

**created_at**:\
Data e ora di creazione del record.
Serve per tracciare quando la categoria è stata inserita.

**updated_at**:\
Data e ora dell’ultima modifica.
Serve per sapere quando la categoria è stata aggiornata.

---

## 2. products

Questa tabella contiene tutte le informazioni principali dei prodotti.

### Colonne

**id**:\
Chiave primaria interna del prodotto.
Serve al database per identificare univocamente il prodotto.

**category_id**:\
Chiave esterna che collega il prodotto alla sua categoria.
Serve a sapere a quale categoria appartiene.

**name**:\
Nome del prodotto.
Esempio: “Pasto liofilizzato pasta e ceci”.

**slug**:\
Versione del nome usata negli URL.
Esempio: pasto-liofilizzato-pasta-e-ceci.

**short_description**:\
Descrizione breve del prodotto.
Serve nelle card prodotto, nella homepage o nei risultati ricerca.

**description**:\
Descrizione completa del prodotto.
Serve nella pagina dettaglio per spiegare bene caratteristiche, uso, vantaggi.

**brand**:\
Marca del prodotto.
Può essere utile per filtrare o per informazione commerciale.

**price**:\
Prezzo attuale del prodotto.
È il prezzo di vendita standard.

**weight_grams**:\
Peso del prodotto in grammi.
Utile per dettagli tecnici, confronto prodotti e magari in futuro anche spedizione.

**servings**:\
Numero di porzioni offerte dal prodotto.
Utile nel settore survival, perché l’utente vuole capire quante persone copre.

**calories**:\
Apporto calorico del prodotto.
È un attributo chiave per prodotti survival/emergenza.

**storage_life_months**:\
Durata di conservazione espressa in mesi.
Serve a comunicare quanto a lungo il prodotto si conserva.
(-garantita, uguale per tutti i prodotti -)

**preparation_type**:\
Tipo di preparazione richiesto.\
Esempio:\
ready_to_eat\
add_hot_water\
add_cold_water

Serve sia per informare l’utente sia per il confronto tra prodotti.

**water_needed_ml**:\
Quantità d’acqua necessaria per la preparazione, in millilitri.
Utile perché la disponibilità di acqua è un fattore importante.

**quantity_available**:\
Quantità effettivamente disponibile in magazzino.
Serve per capire se il prodotto può essere acquistato.

**is_active**:\
Indica se il prodotto è pubblicato e visibile nello shop.
Se è false, il prodotto esiste nel DB ma non viene mostrato agli utenti.

**image_url**:\
Percorso o URL dell’immagine.
È il file che il sito deve mostrare.
(-assumiamo solo 1 foto per prodotto-)

**created_at**:\
Data e ora di creazione del prodotto.

**updated_at**:\
Data e ora dell’ultima modifica del prodotto.

---

## 3. discount_codes

Serve per l'extra relativo ai codici sconto

### Colonne

**id**:\
Chiave primaria del codice sconto.

**code**:\
Codice che l’utente inserisce al checkout.
Esempio: WELCOME10.

**description**:\
Descrizione interna o marketing del codice.
Esempio: “Sconto benvenuto 10%”.

**discount_type**:\
Tipo di sconto applicato.
Può indicare, per esempio:

percentage = sconto percentuale\
fixed = sconto fisso in euro

**discount_value**:\
Valore dello sconto.
Se discount_type = percentage, può essere 10.
Se discount_type = fixed, può essere 5.00.

**min_order_amount**:\
Importo minimo richiesto per usare il codice.
Serve a impedire l’uso del coupon su ordini troppo piccoli.

**starts_at**:\
Data e ora da cui il codice diventa valido.

**ends_at**:\
Data e ora fino a cui il codice è valido.
Data e ora da cui il codice diventa non più valido.

**is_active**:\
Indica se il codice è attivo.
Se è false, anche se la data sarebbe valida, il codice non deve funzionare.

**created_at**:\
Data e ora di creazione del codice.

**updated_at**:\
Data e ora dell’ultima modifica del codice.

---

## 4. orders

Questa tabella rappresenta gli ordini creati al checkout.

### Colonne generali

**id**:\
Chiave primaria dell’ordine.

**order_number**:\
Codice ordine leggibile e comunicabile al cliente.
Esempio: ODM-2026-0001.

**discount_code_id**:\
Chiave esterna verso il codice sconto usato, se presente (NULLABLE).
Serve a sapere se l’ordine ha beneficiato di una promozione.

### Colonne cliente

**customer_email**:\
Email del cliente.
Serve per inviare conferma ordine.

**customer_first_name**:\
Nome del cliente.

**customer_last_name**:\
Cognome del cliente.

**phone**:\
Telefono del cliente, facoltativo.
Può servire per spedizione o contatto.

### Colonne indirizzo di fatturazione

**billing_address_line1**:\
Prima riga dell’indirizzo di fatturazione.
Esempio: via e numero civico.

**billing_address_line2**:\
Seconda riga dell’indirizzo, facoltativa.
Esempio: interno, scala, piano.

**billing_city**:\
Città di fatturazione.

**billing_postal_code**:\
CAP di fatturazione.

**billing_province**:\
Provincia di fatturazione.

**billing_country**:\
Nazione di fatturazione.

### Colonne indirizzo di spedizione

**shipping_address_line1**:\
Prima riga dell’indirizzo di spedizione.

**shipping_address_line2**:\
Seconda riga, facoltativa.

**shipping_city**:\
Città di spedizione.

**shipping_postal_code**:\
CAP di spedizione.

**shipping_province**:\
Provincia di spedizione.

**shipping_country**:\
Nazione di spedizione.

### Colonne economiche

**subtotal_amount**:\
Totale dei prodotti prima di sconti e spedizione.
È la somma delle righe ordine.

**discount_amount**:\
Importo totale scontato grazie al coupon.
Se non c’è coupon, vale 0.

**shipping_amount**:\
Costo della spedizione applicato all’ordine.
Può essere 0 se si attiva la spedizione gratuita.

**total_amount**:\
Totale finale pagato dal cliente.\
Formula:
subtotal_amount - discount_amount + shipping_amount

### Colonne di stato

**placed_at**:\
Data e ora in cui l’ordine è stato effettivamente confermato.

**status**:\
Stato dell'ordine.

**customer_email_sent**:\
Indica se la mail è stata inviata al cliente.

**vendor_email_sent**:\
Indica se la mail è stata inviata al venditore (titolare e-commerce).

**created_at**:\
Data e ora di creazione del record ordine.

**updated_at**:\
Data e ora dell’ultima modifica dell’ordine.

---

## 5. order_product

Questa tabella contiene il dettaglio dei prodotti acquistati in un ordine.

### Colonne

**id**:\
Chiave primaria della riga ordine.

**order_id**:\
Chiave esterna verso l’ordine.
Serve a sapere a quale ordine appartiene la riga.

**product_id**:\
Chiave esterna verso il prodotto originario.
Serve come collegamento al catalogo.

**product_name**:\
Nome del prodotto al momento dell’acquisto.
Serve a mantenere lo storico anche se il nome cambia nel catalogo.

**unit_price**:\
Prezzo unitario del prodotto al momento dell’acquisto.
Serve a mantenere lo storico anche se il prezzo cambia nel catalogo.

**quantity**:\
Quantità acquistata di quel prodotto.

---
