'use strict';

let habbits = [];
let globalActiveHabbitId;
let selectionIcoForSave;
const HABBIT_KEY = "HABBIT_KEY";
const page ={
    aside: document.querySelector('.collectionHabits'),
    header:{
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progressPercent'),
        progressCoverBar: document.querySelector('.progressCoverBar')
    },
    main:{
        daysContainer: document.getElementById('days'),
        nextDay: document.querySelector('.habbitDay')
    }
}

function loadData(){
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);

    if(Array.isArray(habbitArray) && habbitArray.length >= 1 ){habbits = habbitArray;}
    else{

        const iconRand = ["sport","food","water"];

        habbits.push({
            'id': habbits.length + 1,
            "icon": `${iconRand[Math.round(Math.random() * 2)]}`,
            "name": "Добро пожаловать",
            "target": 4,
            "days":[
                {"comment": "Здесь будут ваши комментарии в процессе прививания привычек"},
                {"comment": "В правом верхнем углу есть шкала, она показывает сколько дней вам осталось до конца прививания"},
                {"comment": "В левой стороне есть знак плюса - это функция добавления новой привычки"},
                {"comment": "В левой стороне есть знак креста - это функция удаления всех привычек"}
            ]
        })
    }
}

function saveData(){
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function rerenderAside(activeHabbit){
    for(const habbit of habbits){
        const existed = document.querySelector(`[Aside-habbit-id="${habbit.id}"]`);

        if (!existed){
            const element = document.createElement("button");
            element.setAttribute("Aside-habbit-id",habbit.id);
            element.classList.add("habbitIco");
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `<img src="./data/images/${habbit.icon}.svg"/>`;

            if (activeHabbit.id === habbit.id){
                element.classList.add("activeIco");
                element.classList.remove("habbitIco");
            }
            else{
                element.classList.add("habbitIco");
                element.classList.remove("activeIco");
            }

            page.aside.appendChild(element);
            
            continue;
        }

        if (activeHabbit.id === habbit.id){
            existed.classList.add("activeIco");
            existed.classList.remove("habbitIco");
        }
        else{
            existed.classList.add("habbitIco");
            existed.classList.remove("activeIco");
        }
    }
}

function rerenderHead(activeHabbit){
    page.header.h1.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1 ? 100: activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + ' %';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`)
}

function rerenderMain(activeHabbit){
    page.main.daysContainer.innerHTML ='';

    for(const i in activeHabbit.days){
        const element = document.createElement("div");
        element.classList.add('habbit');

        element.innerHTML = 
        `<div class="habbitDay">День ${Number(i) + 1}</div>
        <div class="habbitComment">${activeHabbit.days[i].comment}</div>
        <button class="habbitDelete" onclick="removeDay(${i})"><img src="./data/images/delete.svg" /></button>`;
        
        page.main.daysContainer.appendChild(element);
    }

    page.main.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId){
    globalActiveHabbitId = activeHabbitId;
    
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);

    if(!activeHabbit){
        return;
    }

    document.location.replace(document.location.pathname + '#' + activeHabbitId);

    rerenderAside(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderMain(activeHabbit);
}

function addDays(event){
    event.preventDefault();

    const data = new FormData(event.target);
    const comment = data.get("comment");

    event.target['comment'].classList.remove('error');

    if(!comment){
        event.target['comment'].classList.add('error');
        return;
    }
    
    habbits = habbits.map(habbit =>{
        if(habbit.id === globalActiveHabbitId){
            return{
                ...habbit,
                days: habbit.days.concat([{comment}])
            }
        }
        return habbit;
    })

    event.target['comment'].value = '';

    rerender(globalActiveHabbitId);
    saveData();
}

function addHabbit(event){
    const data = new FormData(event.target);
    let name = data.get("name");
    const target = data.get("target");
    const iconRand = ["sport","food","water"];

    name.trim();

    if(name === ""){
        name = "Без имени";
    }
    else if(name.length > 25){
        name = name.slice(0,25);
    }

    habbits.push({
        'id': habbits.length + 1,
        "icon": `${selectionIcoForSave ?? iconRand[Math.round(Math.random() * 2)]}`,
        "name": `${name}`,
        "target": target > 0 ? target: 1,
        "days":[]
    })
    
    rerender(globalActiveHabbitId);
    saveData();
}

function removeDay(index){
    habbits = habbits.map(habbit =>{
        if(habbit.id === globalActiveHabbitId){
            habbit.days.splice(index,1);
            return{
                ...habbit,
                days: habbit.days
            };
        }

        return habbit;
    })

    rerender(globalActiveHabbitId);
    saveData();
}

function selectionIco(context,nameIco){
   for(const button of document.querySelector('.iconSelect').childNodes){

    if(button.classList === undefined){continue;}
    else if(button.classList.value === 'activeIco'){
        button.classList.remove('activeIco');
        button.classList.add('habbitIco');
     }
   }

   context.classList.remove('habbitIco');
   context.classList.add('activeIco');

   selectionIcoForSave = nameIco;
}

function isShowPopup(){
    const isShow = document.querySelector(".cover");
    
    if (isShow.style.display === 'flex'){
        isShow.style.display = 'none';
    }
    else{
        isShow.style.display = 'flex';
    }
}

function delateAllHabbits(){
    habbits = [];

    rerender(globalActiveHabbitId);
    saveData();

    location.reload();
}

(() =>{
    loadData();
    const hashId = Number(document.location.hash.replace('#',''));
    const urlHabbit = habbits.find(habbits => habbits.id == hashId);
    
    if(urlHabbit){
        rerender(urlHabbit.id);
    }
    else{
        rerender(habbits[0].id);
    }
})()
