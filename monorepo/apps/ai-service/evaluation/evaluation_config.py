"""
Evaluation Configuration Module

This module contains configuration settings for model evaluation,
including paths, thresholds, and evaluation parameters.
"""

from typing import Dict, Any
from dataclasses import dataclass
from pathlib import Path

# Base paths
BASE_PATH = Path(__file__).parent.parent  # Go up one level from evaluation/
STORAGE_PATH = BASE_PATH / "storage"
TEST_IMAGES_PATH = BASE_PATH / "tests" / "images"
EVALUATION_RESULTS_PATH = BASE_PATH / "evaluations"  # Changed to evaluations folder

# Ensure directories exist
EVALUATION_RESULTS_PATH.mkdir(parents=True, exist_ok=True)


@dataclass
class EvaluationConfig:
    """Configuration settings for model evaluation."""
    
    # Model paths
    models_dir: Path = STORAGE_PATH / "saved_models"
    
    # Test data paths
    test_images_dir: Path = TEST_IMAGES_PATH
    
    # Output paths
    results_dir: Path = EVALUATION_RESULTS_PATH
    
    # Evaluation parameters
    confidence_threshold: float = 0.5
    iou_threshold: float = 0.5
    max_test_samples: int = None  # None means use all
    
    # Batch processing
    batch_size: int = 32
    num_workers: int = 4
    
    # Report settings
    generate_visualizations: bool = True
    generate_detailed_report: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            'models_dir': str(self.models_dir),
            'test_images_dir': str(self.test_images_dir),
            'results_dir': str(self.results_dir),
            'confidence_threshold': self.confidence_threshold,
            'iou_threshold': self.iou_threshold,
            'max_test_samples': self.max_test_samples,
            'batch_size': self.batch_size,
            'num_workers': self.num_workers,
            'generate_visualizations': self.generate_visualizations,
            'generate_detailed_report': self.generate_detailed_report,
        }


# Default configuration instance
default_config = EvaluationConfig()
