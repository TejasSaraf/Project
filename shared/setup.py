from setuptools import setup, find_packages

setup(
    name="sprint-shared",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "boto3",
        "python-dotenv",
    ],
    author="Sprint AI",
    author_email="your-email@example.com",
    description="Shared library for Sprint AI services",
    python_requires=">=3.8",
)
