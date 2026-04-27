# CutisIQ: Skincare Ingredient Analysis

## 🎬 Demo Video
[![CutisIQ Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/WDVm2PUrfvA)

> Watch our full project walkthrough and demo on YouTube: https://youtu.be/WDVm2PUrfvA

## 📄 Research Paper
[![Research Paper](https://img.shields.io/badge/PDF-Research%20Paper-blue?style=for-the-badge&logo=adobeacrobatreader)](./rishindra_csr.pdf)

Welcome to the CutisIQ repository. This project is divided into two main parts: our initial hackathon project (Version 1) and our Machine Learning final project (Version 2).

### Version 1: The Hackathon Winner
We originally built CutisIQ during a hackathon. The goal was to create an app where users could scan the ingredients on the back of skincare products to understand what each chemical actually does. We built a full-stack web application (using Next.js and FastAPI) that linked text recognition to a skincare database. Our working prototype won the hackathon because it made complex chemical names easy for regular consumers to understand.

You can find the code for the web app in the `version 1` folder.

### Version 2: Machine Learning Final Project
For our university Machine Learning course project, we wanted to make the backend smarter. Instead of just looking up ingredients in a static database, we trained machine learning models to predict an ingredient's function using Natural Language Processing (TF-IDF). 

We compared several baseline models and eventually optimized our pipeline using a Class Sparsity Reduction Strategy to handle imbalanced data, giving us much stronger and more reliable predictions.

### How to navigate the repository
If you are looking for our ML course project:
1. Go to the `version 2 / v2_as_ML_finalproject` folder.
2. Read the README inside that folder for instructions on how to run our Jupyter Notebook.
3. The dataset and our final `model_training.ipynb` file are all located there.

Additionally, the `version 2 / integration` folder contains an experimental setup demonstrating how these models can be deployed to a web backend.

**Note on Live App Availability:**
Because our working prototype uses a free-tier Supabase (PostgreSQL) database, the backend automatically pauses after a week of inactivity. If you try to use the live CutisIQ web app and it doesn't work, the database is likely asleep! Please feel free to contact me at **rishindra.tech@gmail.com** and I will gladly wake it up so you can experience it...!
