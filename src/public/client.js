let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    images:[],
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
})

// add our markup to the page
const root = document.getElementById('root')
const navbar=document.getElementById('navbar')

//following two function will update store
const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store,App)
}
const storeUpdate=(state,newState)=>{
    store = state.merge(newState)
}


const render = async (root,state,app) => {
    try{
        root.innerHTML = app(state)
    }catch(error){console.log('error at render',error)}
}


// create content
const App = (state) => {
    const { rovers, apod } = state.toJS()

    return `
        <main>
            ${Greeting(store.get('user').get('name'))}
            <section>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}

// this function will create a navbar menu
//call back function for menu_bar
const roverMenu=(rover)=>{
    return `
        <ul>
            <li id="curiosity">${rover[0]}</li>
            <li id="opportunity">${rover[1]}</li>
            <li id="spirit">${rover[2]}</li>
        </ul>
        `

}
//higher order function taking roverMenu function as callback
// this function will create a navbar by calling function roverMenu
const menu_bar=(navbar,state,rover)=>{
    navbar.innerHTML=rover(state.get('rovers'))


}

//this function will create array of image HTML
// and images to UI
const displayImages=(store)=>{
    const d= document.getElementById("forImage")
    let a=""
    store.get('images').forEach((x) => {
        a+=`<img id="i" src="${x}" style="height:350px; width:350px"></img>`   
    });
   d.innerHTML=a
}

//this function making array of images callin displayImages function and updating store for images
const imageGallery=(apod)=>{
    roverArray=apod.data1.latest_photos.map(x=>x.img_src)
    storeUpdate(store,{images:roverArray})
    displayImages(store)
   
}



const display=async (root,roverName,displayR)=>{
    try{
        root.innerHTML =await displayR(roverName)
    }catch(error){console.log('error at display function',error)}
}

// this function is creating HTML to display on the basic of API data in store and updating UI by calling displayRover
const displayRover=async (roverName)=>{
    try{
        await roverData(roverName)
        const {apod}=store.toJS()
        store.get('apod').images=imageGallery(apod)


        return `
    
            <main>
                ${Greeting(store.get('user').get('name'))}
                <section>
                    <p>
                    <div>
                        <h2>Rover Name: ${apod.data1.latest_photos[0].rover.name}</h2>
                        <p>Launch Date:${apod.data1.latest_photos[0].rover.launch_date}</p>
                        <p>Landing Date:${apod.data1.latest_photos[0].rover.landing_date}</p>
                        <p>Mission Status:${apod.data1.latest_photos[0].rover.status}</p>
                        <p>earth_date:${apod.data1.latest_photos[0].earth_date}</p>
                    </div>
                </section>
            </main>
            <footer></footer>
            `
    }catch(error){console.log('error at displayRover',error)}

}
//event listener function for listening to events
const listenEvent=(root,displayRover)=>{
    document.getElementById("curiosity").addEventListener('click',()=>display(root,"curiosity",displayRover))
    document.getElementById("opportunity").addEventListener('click',()=>display(root,"opportunity",displayRover))
    document.getElementById("spirit").addEventListener('click',()=>display(root,"spirit",displayRover))

}

// listening for load event because page should load before any JS is called
window.addEventListener('load', async () => {
    try{
        menu_bar(navbar,store,roverMenu)
        await render(root,store,App)
        listenEvent(root,displayRover)
    }catch(error){console.log('error at eventlistener function',error)}
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod && apod.image.url}" height="350px" width="100%" />
            <p id:"explain">${apod && apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    const { apod } = state.toJS()

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}


//calling backend with rovername which will provide rover Data
const roverData = async (data)=>{
    await fetch('http://localhost:3000/rovers',{
        method:'POST',
        headers : {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({data})
    })
    .then(res => res.json())
    .then(apod=>{ 
        storeUpdate(store,{ apod })}
    ).catch(error => console.log("error:",error));
    
}