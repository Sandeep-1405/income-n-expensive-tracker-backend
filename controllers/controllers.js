const admin = require("firebase-admin");
const serviceAccount = require(process.env.serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const getWorkersDetails = async(req,res)=>{
    try {
        const { owner } = req.params;
        const workerList = [];
    
        const workersSnapshot = await db.collection('workers').where('owner', '==', owner).get();
    
        if (workersSnapshot.empty) {
          return res.status(404).json({ success: false, message: 'No workers found for the given owner.' });
        }
    
        workersSnapshot.forEach(doc => {
          workerList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log(workerList)
        res.status(200).json({ success: true, workers: workerList });
    
      } catch (error) {
        console.error('Error fetching worker details:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch worker details', error });
    }
}

const createworker = async(req,res) =>{
    const {name,date,area,amount,decription,owner} = req.body
    await db.collection('workers').doc().set(req.body)
    console.log("worker created")
    res.status(201)
}

const searchByName = async(req,res)=>{
  const {inputText} = req.params;
  try{
    const listByNames = []
    const listByNamesSnapshot = await db.collection('workers').where('name',"==",inputText).get();

    if (listByNamesSnapshot.empty) {
      return res.status(404).json({ success: false, message: 'No workers found for the given Name.' });
    }

    listByNamesSnapshot.forEach(doc => {
      listByNames.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(listByNames)
    res.status(200).json({ success: true, workers: listByNames });

  } catch (error) {
    console.error('Error fetching worker details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch worker details', error });
  }

}

const searchByArea = async(req,res)=>{
  const {inputText} = req.params;
  try{
    const listByArea = []
    const listByAreasSnapshot = await db.collection('workers').where('area',"==",inputText).get();

    if (listByAreasSnapshot.empty) {
      return res.status(404).json({ success: false, message: 'No workers found for the given area.' });
    }

    listByAreasSnapshot.forEach(doc => {
      listByArea.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(listByArea)
    res.status(200).json({ success: true, workers: listByArea });

  } catch (error) {
    console.error('Error fetching worker details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch worker details', error });
  }

}

module.exports = {
    createworker,
    getWorkersDetails,
    searchByName,
    searchByArea
}