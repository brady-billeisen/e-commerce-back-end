const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  const products = await Product.findAll({ include: Tag });
  return res.json(products);
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const product = await Product.findByPk(req.params.id, { include: Tag });

    if (!product) {
      return res.status(404).json('Product not found.')
    };

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json('Product not found.')
    };

    await product.update(req.body);
    await product.save();

    if (req.body.tagIds) {
      await product.setTags(req.body.tagIds);
    }

    res.json(await product.getTags());
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json('Product not found.')
    };

    await product.destroy();

    res.json('Product deleted.');
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

module.exports = router;
