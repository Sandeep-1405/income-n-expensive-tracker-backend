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
        //console.log(workerList)
        res.status(200).json({ success: true, workers: workerList });
    
      } catch (error) {
        console.error('Error fetching worker details:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch worker details', error });
    }
}

const createWorker = async (req, res) => {
  const { name, date, area, amount, description, owner } = req.body;

  try {
    await db.collection('workers').doc().set(req.body);
    
    console.log("Worker created");
    return res.status(201).json({ message: "Worker created successfully" });
  } catch (error) {
    // Error handling
    console.error("Error creating worker:", error);
    return res.status(500).json({ message: "Failed to create worker" });
  }
};


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

const deleteWorker = async (req, res) => {
  const { id } = req.params;

  try {
    const workerRef = db.collection('workers').doc(id); // Reference to the document by ID
    const workerDoc = await workerRef.get();

    if (!workerDoc.exists) {
      return res.status(404).json({ message: "Worker not found" });
    }

    await workerRef.delete(); // Delete the document by its Firestore document ID

    console.log("Worker Deleted");
    return res.status(200).json({ message: "Worker deleted successfully" });

  } catch (error) {
    console.error("Error deleting worker:", error);
    return res.status(500).json({ message: "Failed to delete worker" });
  }
};

const getWorkerDetailsById = async (req, res) => {
  const { id } = req.params;
  console.log(id)

  try {
    // Get the document by its ID
    const workerDoc = await db.collection('workers').doc(id).get();

    if (!workerDoc.exists) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Get worker data
    const workerData = {
      id: workerDoc.id,
      ...workerDoc.data()
    };

    res.status(200).json({ success: true, worker: workerData });
  } catch (error) {
    console.error("Error fetching worker details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch worker details" });
  }
};

const updateWorker = async (req, res) => {
  const {id} = req.params;
  const {name, date, area, amount, description } = req.body;

  try {
    // Reference to the document
    const workerRef = db.collection('workers').doc(id);

    // Check if the document exists
    const workerDoc = await workerRef.get();

    if (!workerDoc.exists) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Update the document with the new data
    await workerRef.update({ name, date, area, amount, description });

    res.status(200).json({ success: true, message: "Worker updated successfully" });

  } catch (error) {
    console.error("Error updating worker:", error);
    res.status(500).json({ success: false, message: "Failed to update worker" });
  }
};




module.exports = {
  createWorker,
    getWorkersDetails,
    searchByName,
    searchByArea,
    deleteWorker,
    getWorkerDetailsById,
    updateWorker
}