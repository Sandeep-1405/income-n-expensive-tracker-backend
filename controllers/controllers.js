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

const fetchByCategorynSearchInput = async (req, res) => {
  const { owner, type } = req.params;
  const { category = 'All', searchInput = '' } = req.query;
  console.log("Params", req.params);
  console.log("Queries", req.query);

  try {
    const snapShot = db.collection('owners').doc(owner).collection(type);
    let query = snapShot;
    let results = [];

    if (category === 'All' && searchInput === '') {
      // Fetch all documents if no filters are applied
      const allDocs = await snapShot.get();
      allDocs.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    } else if (category === 'All' && searchInput !== '') {
      // Search in 'name' and 'area' fields for the given input
      const nameQuery = snapShot
        .where('name', '>=', searchInput)
        .where('name', '<', searchInput + '\uf8ff');
      const areaQuery = snapShot
        .where('area', '>=', searchInput)
        .where('area', '<', searchInput + '\uf8ff');

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

      results = Array.from(new Map(results.map((item) => [item.id, item])).values());
    } else if (category !== 'All' && searchInput === '') {
      query = snapShot.where('category', '==', category);
      const categorySnapshot = await query.get();
      categorySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    } else if (category !== 'All' && searchInput !== '') {
      const nameQuery = snapShot
        .where('category', '==', category)
        .where('name', '>=', searchInput)
        .where('name', '<', searchInput + '\uf8ff');
      const areaQuery = snapShot
        .where('category', '==', category)
        .where('area', '>=', searchInput)
        .where('area', '<', searchInput + '\uf8ff');

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
      results = Array.from(new Map(results.map((item) => [item.id, item])).values());
    }

    res.status(200).json({ List: results });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};


module.exports = {
  expensiveSearch,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getExpByInputnFilter,

  create,
  getDetails,
  getDetailsById,
  updateList,
  deleteinfo,
  fetchByCategorynSearchInput
}