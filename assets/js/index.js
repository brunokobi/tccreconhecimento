const cam = document.getElementById('cam');
const span = document.getElementById("teste");

const registro={
    matricula:String,
    data:Date,
    local:String
}

const aluno = {
    matricula:String,
    foto:String
}

const options = {
    method:'GET',
    mode:'cors',
    cache:'default'
}
const alunos = [];



function myFunction()
{
registro.local=prompt("Digite o local");
}


  
 

fetch('https://radiant-gorge-04331.herokuapp.com/alunos',options)
.then(response=>{response.json()
    .then(data=> data.map(aluno => {
           alunos.push(aluno); 
        }

        ))

})
.catch(e=>console.log('deu erro:'+ e,message))



function startVideo() {
    myFunction();
    navigator.getUserMedia(
      { video: {} },
      stream => cam.srcObject = stream,
      err => console.error(err)
    )
    console.log(alunos);
    console.log(cam);
  }

//parte do recolhecimento 
  const loadLabels = () => {   
    const labels = [];

    alunos.forEach((aluno,index)=>{
        const{matricula,foto} = aluno;
        labels.push(matricula);

    });
    console.log(labels);

    

    
    return Promise.all(labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 1; i++) {           
           const img = await faceapi.fetchImage(`https://radiant-gorge-04331.herokuapp.com/files/${label}.jpg`)
            const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor()
            descriptions.push(detections.descriptor)
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
    }))
}



Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/assets/lib/face-api/models'),
    //faceapi.nets.faceLandmark68TinyNet.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/lib/face-api/models'),
    // faceapi.nets.faceExpressionNet.loadFromUri('/assets/lib/face-api/models'),
    //faceapi.nets.ageGenderNet.loadFromUri('/assets/lib/face-api/models'),
     faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/lib/face-api/models'),
]).then(startVideo)

cam.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(cam)
    const canvasSize = {
        width: cam.width,
        height: cam.height
    }
    const labels = await loadLabels()
    faceapi.matchDimensions(canvas, canvasSize)
    document.body.appendChild(canvas)
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(
                cam,
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
             //.withFaceExpressions()
            //.withAgeAndGender()
            .withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, canvasSize)
        const faceMatcher = new faceapi.FaceMatcher(labels,0.6)
        const results = resizedDetections.map(d =>
            faceMatcher.findBestMatch(d.descriptor)
        )
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
       // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        // resizedDetections.forEach(detection => {
        //     const { age, gender, genderProbability } = detection           
        //     new faceapi.draw.DrawTextField([
        //         `${parseInt(age, 10)} anos`,
        //         `${gender=="male"?"homem":"mulher"} `
        //     ], detection.detection.box.topRight).draw(canvas)
        // })
        results.forEach((result, index) => {
            const box = resizedDetections[index].detection.box
            const { label, distance } = result
            const nome = "";
            const data = new Date();
            const cont = 0.00;
            
            if (distance * 100 > 50 && this.nome!=label&&label!='unknown'){ 
                 this.nome = label;                 
                 registro.matricula = this.nome;
                 registro.data = data;
                 if(registro.local==null)
                 registro.local='default'
                

                 

                 fetch('https://radiant-gorge-04331.herokuapp.com/registros', {
                     method: 'POST',
                     headers: {
                     'Content-Type': 'application/json',
                     },
                     body: JSON.stringify(registro),
                 })
                 .then((response) => response.json())
                 .then((data) => {
                     console.log('Success:', data);                                      
                            span.innerHTML = 'Presence Now  =>  Matrícula : '+registro.matricula;
                            document.getElementById("teste").style.visibility = "visible";
                            cam.style.backgroundColor='green';
                            cam.style.borderColor='green';                            
                            setTimeout(() => {                                
                                document.getElementById("teste").style.visibility = "hidden";
                                cam.style.backgroundColor='#0053c7';
                                cam.style.borderColor='#fff';                                
                            },3000);
                 })
                 .catch((error) => {
                     console.error('Error:', error);
                 });
            }          
           
            

            new faceapi.draw.DrawTextField([
                `${label} `
            ], box.bottomLeft).draw(canvas)
        })
    }, 100)
})

//probalidade do sexo
//(${parseInt(genderProbability * 100, 10)})

//probilidade de ser a pessoa
//(${parseInt(distance * 100, 10)})

