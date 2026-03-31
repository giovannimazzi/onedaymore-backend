# Project Work - GRUPPO 1

**OneDayMore**

nome repo: `onedaymore-backend`

## BRIEF

BoolShop\
Sviluppare una piattaforma e-commerce lato cliente, ovvero un’applicazione web focalizzata esclusivamente sull’esperienza dell’utente finale che acquista prodotti online.\
Categoria merceologica\
L’e-commerce sarà basato su una categoria merceologica specifica, ovvero un settore di prodotti ben definito, che ne influenzerà non solo i contenuti del sito, ma anche la grafica e l’usabilità della piattaforma, garantendo che la piattaforma sia coerente con il settore di riferimento e offra un’esperienza utente ottimale per suoi i clienti di riferimento.\
Per esempio:\
1 - un e-commerce di tecnologia potrebbe avere un design moderno, con animazioni dinamiche ed una forte attenzione alle specifiche tecniche dei prodotti\
2 - un e-commerce di moda potrebbe puntare su un design elegante e minimalista, con immagini prodotti per lo più verticali\
3 - un e-commerce di prodotti per la cura personale potrebbe avere un design pulito e rassicurante, con una navigazione semplice e più spazi per i testi dei prodotti, pensati per utenti che cercano informazioni chiare\
Requisiti di base e funzionalità extra\
Il progetto è composto da un insieme di funzionalità di base, che tutti i team devono implementare e che costituiscono le funzionalità minime di uno shop online, e da funzionalità extra, che permettono di personalizzare il proprio progetto in base alla visione e alle competenze specifiche del team.\
Milestone obbligatorie\
Le milestone obbligatorie rappresentano il nucleo dell’applicazione. Queste funzionalità devono essere implementate da tutti i team.

1. homepage\
   hero space\
   visualizzazione di almeno due sezioni di prodotti (es. più venduti, ultimi arrivi)\
2. pagina di ricerca\
   barra di ricerca con opzioni di ordinamento (prezzo, nome, recenti)\
   visualizzazione dei risultati di ricerca
3. pagina di dettaglio prodotto\
   visualizzazione delle informazioni del prodotto\
   possibilità di aggiungere il prodotto al carrello\
4. carrello\
   possibilità di modificare le quantità dei prodotti nel carrello\
   visualizzare il totale del carrello
5. checkout\
   inserimento dei dati di fatturazione e spedizione del cliente\
   riepilogo dell’ordine con il totale
6. invio email\
   invio di email di conferma ordine sia al cliente che al venditore\

Milestone extra\
Oltre alle funzionalità di base, ogni team dovrà scegliere ulteriori funzionalità aggiuntive da una lista predefinita. Ogni milestone extra ha un coefficiente di difficoltà, che va da 1 a 5. Ogni team deve selezionare ed implementare un insieme di funzionalità extra la cui somma dei coefficienti di difficoltà raggiunga almeno 10 punti.

1. doppia visualizzazione dei risultati di ricerca (coefficiente: 1)\
   possibilità di visualizzare i risultati di ricerca in griglia o in lista
2. spedizione gratuita (coefficiente: 1)\
   spedizione gratuita per ordini che superano una soglia minima di spesa
3. prodotti in promozione (coefficiente: 2)\
   visualizzare i prodotti in promozione con prezzo originale e scontato
   possibilità di filtrare i prodotti in promozione nella pagina di ricerca
4. codici sconto (coefficiente: 2)\
   inserimento e validazione di un codice promozionale durante il checkout
   il codice sconto deve essere valido entro un determinato periodo (dal/al)
5. wishlist (coefficiente: 2)\
   aggiunta/rimozione prodotti da una lista dei desideri
   visualizzazione della lista in una pagina dedicata
6. paginazione dei risultati (coefficiente: 2)\
   implementare un sistema di paginazione per i risultati di ricerca
   possibilità di selezionare il numero di prodotti da visualizzare per pagina
   mantenere i filtri applicati durante il passaggio tra le pagine
7. prodotti correlati (coefficiente: 2)\
   visualizzare i prodotti correlati nella pagina di dettaglio di un prodotto 2
8. popup di benvenuto (coefficiente: 3)\
   mostrare un popup di benvenuto solamente durante la prima visita dell’utente
   permettere di raccogliere l’email del visitatore
   inviare un’email di ringraziamento\
9. gestione quantità (coefficiente: 3)\
   mostrare le quantità disponibili nella pagina di dettaglio
   impedire che un prodotto esaurito possa essere aggiunto al carrello
   impedire il proseguimento se un prodotto nel carrello diventa esaurito
10. confronta prodotti (coefficiente: 3)\
    possibilità di selezionare fino a 3 prodotti e confrontarli in tabella
11. pagamento (coefficiente: 4)\
    integrare un sistema di pagamento
12. assistente AI (coefficiente: 5)\
    chatbot che aiuta gli utenti a trovare risposte sul prodotto visualizzato
    È possibile scegliere funzionalità che superino i 10 punti complessivi, ma è importante sottolineare che tutte le funzionalità extra scelte dovranno essere necessariamente implementate e completate. Si raccomanda quindi di valutare attentamente le proprie capacità tecniche e la gestione del tempo a disposizione, in quanto poi si è tenuti a rispettare gli impegni presi all’inizio del progetto.

Requisiti tecnici

- il sito deve essere completamente responsive
- è fortemente consigliato utilizzare le tecnologie studiate durante il corso
- tutti i dati inseriti dagli utenti devono essere validati sia lato client che lato server
- la pagina non deve mai eseguire un refresh completo
- gestire il caso in cui la pagina non esiste (la classica pagina 404)
- condivisione dei risultati di ricerca tramite URL
- l’ID prodotto non deve mai essere esposto
