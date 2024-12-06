const admin = require("firebase-admin");

/*admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});*/


const serviceAccount = JSON.parse(Buffer.from(process.env.base64, 'base64').toString('utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
    //console.error('Error fetching data:', error);
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

    //console.log("Worker Deleted");
    return res.status(200).json({ message: "Worker deleted successfully" });

  } catch (error) {
    //console.error("Error deleting worker:", error);
    return res.status(500).json({ message: "Failed to delete worker" });
  }
};

const getExpensiveDetailsById = async (req, res) => {
  const { id,owner } = req.params;
  //console.log(owner)

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
    //console.error("Error fetching worker details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch worker details" });
  }
};

const updateExpensive = async (req, res) => {
  const {id,owner} = req.params;
  const {name, date, area, paid, due, amount,category } = req.body;

  try {
    // Reference to the document
    const workerRef = await db.collection('owners').doc(owner).collection('Expensives').doc(id);

    // Check if the document exists
    const workerDoc = await workerRef.get();

    if (!workerDoc.exists) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Update the document with the new data
    await workerRef.update({ name, date, area, paid, due, amount,category });

    res.status(200).json({ success: true, message: "Worker updated successfully" });

  } catch (error) {
    //console.error("Error updating worker:", error);
    res.status(500).json({ success: false, message: "Failed to update worker" });
  }
};

const createCategory = async (req,res)=>{
  const {owner} = req.params;
  const {category} = req.body;

  try{
   await db.collection('owners').doc(owner).collection('Categories').add({category});

   //console.log("Category Created")
   res.status(201).json({message:"Category Created"})
  }catch(error){
    //console.log(error)
    res.status(500).json({error})
  }
}

const getCategory = async(req,res) => {
  const {owner} = req.params;
  //console.log(owner)

  try{
    const categories = [];

    const categorySnapshot = await db.collection('owners').doc(owner).collection('Categories').get();

    categorySnapshot.forEach(category=>{
      categories.push({
        id: category.id,
        ...category.data()
      })
    })
    //console.log(categories)

    res.status(200).json({categories})

  }
  catch(error){
    //console.log(error)
    res.status(500).json({error})
  }
}


const fetchExpensivesByCategory = async(req,res)=>{
  const {owner,category} = req.params;

  try{
    const categoryExpensives = await db.collection('owners').doc(owner).collection('Expensives').where('category','==',category).get();

    const categoryExpensivesList = []

    categoryExpensives.forEach(doc=>{
      categoryExpensivesList.push({
        id:doc.id,
        ...doc.data()
      })
    })
    res.status(200).json({Expensives: categoryExpensivesList})
  }catch(error){
    //console.log(error)
    res.status(500).json({error})
  }
}

const updateCategory = async (req, res) => {
  const { id,owner } = req.params; // Get category ID from the URL
  const { category } = req.body; // Get the new category name from the body
  
  try {
    const categoryRef = db.collection('owners').doc(owner).collection('Categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update the category name
    await categoryRef.update({ category });
    return res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    //console.error('Error updating category: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCategory = async (req, res) => {
  const { owner,id } = req.params;

  try {
    const categoryRef = db.collection('owners').doc(owner).collection('Categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the category
    await categoryRef.delete();
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    //console.error('Error deleting category: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getExpByInputnFilter = async (req, res) => {
  const { owner } = req.params;
  const { searchInput, category } = req.query;

  //console.log(`SearchInput: ${searchInput}, Category: ${category}`);

  try {
    // Initialize an array to store results
    const results = [];

    // Define queries for name and area
    const baseQuery = db
      .collection('owners')
      .doc(owner)
      .collection('Expensives')
      .where('category', '==', category);

    const nameQuery = baseQuery
      .where('name', '>=', searchInput)
      .where('name', '<', searchInput + '\uf8ff');

    const areaQuery = baseQuery
      .where('area', '>=', searchInput)
      .where('area', '<', searchInput + '\uf8ff');

    // Execute both queries in parallel
    const [nameSnapshot, areaSnapshot] = await Promise.all([
      nameQuery.get(),
      areaQuery.get(),
    ]);

    // Add results from name query
    nameSnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    // Add results from area query
    areaSnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    // Remove duplicate results
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.id, item])).values()
    );

    // Respond with filtered data
    return res.status(200).json({
      success: true,
      Expensives: uniqueResults,
    });
  } catch (error) {
    //console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
    });
  }
};


const getDetails = async(req,res)=>{
  try {
      const { owner,type } = req.params;
      //console.log(owner)
      const List = [];
  
      const snapshot = await db.collection('owners').doc(owner).collection(type).get();
  
      if (snapshot.empty) {
        return res.status(404).json({ success: false, message: 'No data found.' });
      }
  
      snapshot.forEach(doc => {
        List.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      res.status(200).json({ success: true, List: List });
  
    } catch (error) {
      //console.error('Error fetching details:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch details', error });
  }
}

const create = async (req, res) => {
  const { name,date,area,paid,due,amount,category, heading,description,owner,type } = req.body;
  //console.log(req.body);

  try {
    const snapShot = await db.collection('owners').doc(owner).collection(type);

    const Data =
      type === "notes"
        ? { heading, description }
        : { name, date, area, paid, due, amount, category };

    await snapShot.add(Data);
    
    //console.log("created");
    return res.status(201).json({ message: "Created" });
  } catch (error) {
    //console.error("Error creating:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

const getDetailsById = async (req, res) => {
  const { id,owner,type } = req.params;
  //console.log(type)

  try {
    const snapShot = await db.collection('owners').doc(owner).collection(type).doc(id).get();

    if (!snapShot.exists) {
      return res.status(404).json({ success: false, message: "Details not found" });
    }

    const Data = {
      id: snapShot.id,
      ...snapShot.data()
    };

    res.status(200).json({ success: true, List: Data });
  } catch (error) {
    //console.error("Error fetching worker details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch details" });
  }
};

const updateList = async (req, res) => {
  const { id, type } = req.params;
  
  const { name, date, area, paid, due, amount, category, heading, description, owner } = req.body;

  //console.log(req.body)

  try {
    const snapShot = await db.collection('owners').doc(owner).collection(type).doc(id);
    const doc = await snapShot.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Determine fields to update based on type
    const updateData =
      type === "notes"
        ? { heading, description }
        : { name, date, area, paid, due, amount, category };

    // Perform update
    await snapShot.update(updateData);

    res.status(200).json({ success: true, message: `${type} updated successfully` });
  } catch (error) {
    //console.error("Error updating document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update details",
      error: error.message,
    });
  }
};

const deleteinfo = async (req, res) => {
  const { owner,id,type } = req.params;

  try {
    const Ref = db.collection('owners').doc(owner).collection(type).doc(id);
    const Doc = await Ref.get();

    if (!Doc.exists) {
      return res.status(404).json({ message: 'Not found' });
    }

    await Ref.delete();
    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    //console.error('Error deleting category: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  create,
  expensiveSearch,
  deleteExpensive,
  getExpensiveDetailsById,
  updateExpensive,
  createCategory,
  getCategory,
  fetchExpensivesByCategory,
  updateCategory,
  deleteCategory,
  getExpByInputnFilter,

  getDetails,
  getDetailsById,
  updateList,
  deleteinfo,
}