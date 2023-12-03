const express = require('express');
const { Document } = require('../models/document');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');



const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    const file = req.file;
    if (!file) return res.status(400).send('no image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;


    let document = new Document({
        name: req.body.name,
        image: `${basePath}${fileName}`,
        price: req.body.price,
        isFeatured: req.body.isFeatured

    });

    document = await document.save();

    if (!document) return res.status(500).send('The document cannot be created');

    res.send(document);
});



router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    console.log(req.body);
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Document Id');
    }

    const document = await Document.findById(req.params.id);
    if (!document) return res.status(400).send('Invalid Document!');


    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = document.image;
    }


    const updatedDocument = await Document.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            image: imagepath,
            price: req.body.price,

            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!updatedDocument) return res.status(500).send('the Document cannot be updated!');

    res.send(updatedDocument);
});


router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Document Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const document = await Document.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!document) return res.status(500).send('the gallery cannot be updated!');

    res.send(document);
});


router.get(`/`, async (req, res) => {

    console.log(req.query);
    const documentList = await Document.find();

    if (!documentList) {
        res.status(500).json({ success: false });
    }

    res.send(documentList);
});


module.exports = router;







