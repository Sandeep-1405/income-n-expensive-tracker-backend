const admin = require("firebase-admin");

/*admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});*/


const serviceAccount = JSON.parse(Buffer.from(process.env.base64, 'base64').toString('utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const getExpensivesDetails = async(req,res)=>{
    try {
        const { owner } = req.params;
        //console.log(req.params)
        //console.log(owner)
        const workerList = [];
    
        const workersSnapshot = await db.collection('owners').doc(owner).collection('Expensives').get();
    
        if (workersSnapshot.empty) {
          return res.status(404).json({ success: false, message: 'No workers found for the given Doc.' });
        }
    
        workersSnapshot.forEach(doc => {
          workerList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        //console.log(workerList)
        res.status(200).json({ success: true, Expensives: workerList });
    
      } catch (error) {
        console.error('Error fetching worker details:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch worker details', error });
    }
}

const createExpensive = async (req, res) => {
  const { name,date,area,paid,due,amount, docName } = req.body;
  console.log(docName)

  try {
    await db.collection('owners').doc(docName).collection("Expensives").add({name,date,area,paid,due,amount});
    
    console.log("Expensive created");
    return res.status(201).json({ message: "Worker created successfully" });
  } catch (error) {
    // Error handling
    console.error("Error creating worker:", error);
    return res.status(500).json({ message: "Failed to create worker" });
  }
};


const expensiveSearch = async (req, res) => {
  const { owner, input } = req.params;
  //console.log(input)

  try {
    const results = [];

    let query;
    if (!input) {
      // If input is empty, fetch all documents
      query = db.collection('owners').doc(owner).collection('Expensives');
    } else {
      // If input is provided, search by name or area
      const nameQuery = db
        .collection('owners')
        .doc(owner)
        .collection('Expensives')
        .where('name', '>=', input)
        .where('name', '<', input + '\uf8ff');

      const areaQuery = db
        .collection('owners')
        .doc(owner)
        .collection('Expensives')
        .where('area', '>=', input)
        .where('area', '<', input + '\uf8ff');

      // Execute both queries and combine results
      const [nameSnapshot, areaSnapshot] = await Promise.all([
        nameQuery.get(),
        areaQuery.get(),
      ]);

      nameSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      areaSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      // Remove duplicates
      const uniqueResults = Array.from(
        new Map(results.map((item) => [item.id, item])).values()
      );

      return res.status(200).json({ success: true, Expensives: uniqueResults });
    }

    // Fetch all documents if no input
    const allSnapshot = await query.get();
    allSnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, workers: results });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
};




const deleteExpensive = async (req, res) => {
  const { owner,id } = req.params;

  try {
    const workerRef = db.collection('owners').doc(owner).collection('Expensives').doc(id); // Reference to the document by ID
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

const getExpensiveDetailsById = async (req, res) => {
  const { id,owner } = req.params;
  console.log(owner)

  try {
    // Get the document by its ID
    const workerDoc = await db.collection('owners').doc(owner).collection('Expensives').doc(id).get();

    if (!workerDoc.exists) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Get worker data
    const workerData = {
      id: workerDoc.id,
      ...workerDoc.data()
    };

    res.status(200).json({ success: true, Expensive: workerData });
  } catch (error) {
    console.error("Error fetching worker details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch worker details" });
  }
};

const updateExpensive = async (req, res) => {
  const {id,owner} = req.params;
  const {name, date, area, paid, due, amount } = req.body;

  try {
    // Reference to the document
    const workerRef = await db.collection('owners').doc(owner).collection('Expensives').doc(id);

    // Check if the document exists
    const workerDoc = await workerRef.get();

    if (!workerDoc.exists) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Update the document with the new data
    await workerRef.update({ name, date, area, paid, due, amount });

    res.status(200).json({ success: true, message: "Worker updated successfully" });

  } catch (error) {
    console.error("Error updating worker:", error);
    res.status(500).json({ success: false, message: "Failed to update worker" });
  }
};




module.exports = {
  createExpensive,
  getExpensivesDetails,
  expensiveSearch,
  deleteExpensive,
  getExpensiveDetailsById,
  updateExpensive
}