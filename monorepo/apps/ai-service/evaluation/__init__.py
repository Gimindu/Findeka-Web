"""
Evaluation Module - Multi-modal Learning Evaluation Framework

This module provides comprehensive evaluation functionality for machine learning models,
including metrics calculation, experiment evaluation, and detailed reporting.

Submodules:
    - config: Configuration settings for evaluation
    - metrics: Core metrics calculation (accuracy, precision, recall, F1)
    - evaluate_models: Basic model evaluation and reporting
    - evaluate_experiments: Multi-experiment comparison framework
    - evaluate_with_images: Image-aware evaluation with test image loading
    - statistical_analysis: Advanced statistical metrics and analysis
"""

__version__ = "1.0.0"
__author__ = "AI Service Team"

# Import main evaluation components
try:
    from .evaluation_config import EvaluationConfig, default_config
    from .evaluation_metrics import EvaluationMetrics, MetricsResult
    from .evaluate_models import ModelEvaluator, EvaluationReport
    from .evaluate_experiments import ExperimentEvaluator
    from .evaluate_with_images import ImageDataLoader, ExperimentEvaluatorWithImages
    from .statistical_analysis import StatisticalAnalyzer, InferenceMetrics
    from .text_data_loader import TextDataLoader
except ImportError as e:
    # Fallback for direct execution
    print(f"Warning: Some evaluation modules could not be imported: {e}")

__all__ = [
    'EvaluationConfig',
    'default_config',
    'EvaluationMetrics',
    'MetricsResult',
    'ModelEvaluator',
    'EvaluationReport',
    'ExperimentEvaluator',
    'ImageDataLoader',
    'ExperimentEvaluatorWithImages',
    'StatisticalAnalyzer',
    'InferenceMetrics',
    'TextDataLoader',
]
